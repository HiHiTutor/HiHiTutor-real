const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const login = async (req, res) => {
  const requestId = res.getHeader('X-Request-ID') || Date.now().toString();
  
  // Log request details
  console.log(`[${requestId}] 👉 Admin login attempt:`, {
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin'],
      'user-agent': req.headers['user-agent']
    },
    body: req.body ? {
      identifier: req.body.identifier,
      hasPassword: !!req.body.password
    } : 'No body',
    method: req.method,
    path: req.path,
    query: req.query
  });

  try {
    // Validate request body
    if (!req.body) {
      throw new Error('Request body is missing');
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log(`[${requestId}] ❌ Login failed: Missing credentials`);
      return res.status(400).json({
        success: false,
        message: 'Please provide both identifier and password',
        debug: { hasIdentifier: !!identifier, hasPassword: !!password }
      });
    }

    // Environment check
    if (!process.env.JWT_SECRET && !process.env.REACT_APP_JWT_SECRET) {
      console.error(`[${requestId}] ❌ Critical error: No JWT secret found`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        debug: {
          hasJwtSecret: false,
          env: process.env.NODE_ENV,
          availableEnvVars: Object.keys(process.env).filter(key => 
            key.includes('JWT') || key.includes('MONGO') || key.includes('NODE')
          )
        }
      });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET;

    // Database connection check
    if (mongoose.connection.readyState !== 1) {
      console.log(`[${requestId}] ⚠️ MongoDB not connected, attempting to reconnect...`);
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log(`[${requestId}] ✅ Successfully reconnected to MongoDB`);
      } catch (dbError) {
        console.error(`[${requestId}] ❌ MongoDB connection failed:`, {
          error: dbError.message,
          code: dbError.code,
          name: dbError.name
        });
        return res.status(500).json({
          success: false,
          message: 'Database connection failed',
          debug: {
            error: dbError.message,
            mongoState: mongoose.connection.readyState
          }
        });
      }
    }

    // Find user
    let user;
    try {
      user = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });

      if (!user) {
        console.log(`[${requestId}] ❌ User not found:`, identifier);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log(`[${requestId}] ✅ User found:`, {
        id: user._id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password,
        passwordLength: user.password?.length
      });

      // Verify admin status
      if (user.userType !== 'admin' || user.role !== 'admin') {
        console.log(`[${requestId}] ❌ Non-admin user attempted login:`, {
          userType: user.userType,
          role: user.role
        });
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`[${requestId}] 🔐 Password verification:`, {
        isMatch,
        providedPasswordLength: password.length,
        storedPasswordLength: user.password.length
      });

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          role: user.role
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Send success response
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          role: user.role,
          status: user.status
        }
      });

    } catch (dbError) {
      console.error(`[${requestId}] ❌ Database operation failed:`, {
        error: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      return res.status(500).json({
        success: false,
        message: 'Database error',
        debug: {
          error: dbError.message,
          code: dbError.code
        }
      });
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Unhandled error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      debug: {
        error: error.message,
        type: error.name,
        env: process.env.NODE_ENV
      }
    });
  }
};

module.exports = {
  login
}; 