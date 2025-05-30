const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const login = async (req, res) => {
  const requestId = res.getHeader('X-Request-ID');
  console.log(`[${requestId}] 👉 Admin login request received:`, {
    body: req.body,
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path
  });

  try {
    // Check environment variables
    console.log(`[${requestId}] 🔧 Environment check:`, {
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length,
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriLength: process.env.MONGODB_URI?.length,
      mongooseState: mongoose.connection.readyState,
      mongooseStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    });

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log(`[${requestId}] ❌ Login failed: Missing credentials`);
      return res.status(400).json({
        success: false,
        message: 'Please provide both identifier and password',
        requestId
      });
    }

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error(`[${requestId}] ❌ Critical error: JWT_SECRET not set`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET missing',
        requestId
      });
    }

    if (!process.env.MONGODB_URI) {
      console.error(`[${requestId}] ❌ Critical error: MONGODB_URI not set`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: MONGODB_URI missing',
        requestId
      });
    }

    // Check MongoDB connection
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
      } catch (reconnectError) {
        console.error(`[${requestId}] ❌ MongoDB reconnection failed:`, {
          error: reconnectError.message,
          stack: reconnectError.stack,
          code: reconnectError.code
        });
        return res.status(500).json({
          success: false,
          message: 'Database connection failed',
          error: reconnectError.message,
          requestId
        });
      }
    }

    // Find user by email or phone
    let user;
    try {
      console.log(`[${requestId}] 🔍 Looking for admin user:`, {
        identifier,
        query: {
          $or: [
            { email: identifier },
            { phone: identifier }
          ]
        }
      });

      user = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });

      if (!user) {
        console.log(`[${requestId}] ❌ Login failed: User not found for identifier:`, identifier);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          requestId
        });
      }

      console.log(`[${requestId}] ✅ User found:`, {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password,
        passwordLength: user.password?.length
      });

      // Check if user is admin
      if (user.userType !== 'admin' || user.role !== 'admin') {
        console.log(`[${requestId}] ❌ Login failed: User is not an admin`, {
          userType: user.userType,
          role: user.role
        });
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
          requestId
        });
      }

    } catch (dbError) {
      console.error(`[${requestId}] ❌ Database error:`, {
        error: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: dbError.message,
        requestId
      });
    }

    // Verify password
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`[${requestId}] 🔐 Password verification:`, {
        isMatch,
        providedPasswordLength: password.length,
        hashedPasswordLength: user.password.length
      });

      if (!isMatch) {
        console.log(`[${requestId}] ❌ Login failed: Invalid password`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          requestId
        });
      }
    } catch (bcryptError) {
      console.error(`[${requestId}] ❌ Password verification error:`, {
        error: bcryptError.message,
        stack: bcryptError.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: bcryptError.message,
        requestId
      });
    }

    // Generate JWT token
    try {
      const tokenPayload = {
        id: user._id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role
      };
      console.log(`[${requestId}] 🎟️ Generating token with payload:`, tokenPayload);

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`[${requestId}] ✅ Token generated successfully:`, {
        tokenLength: token.length,
        expiresIn: '24h'
      });

      // Return user info and token
      const response = {
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
        },
        requestId
      };

      console.log(`[${requestId}] ✅ Login successful:`, {
        userId: user._id,
        userType: user.userType,
        role: user.role
      });

      res.json(response);
    } catch (jwtError) {
      console.error(`[${requestId}] ❌ Token generation error:`, {
        error: jwtError.message,
        stack: jwtError.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: jwtError.message,
        requestId
      });
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Unhandled error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      requestId
    });
  }
};

module.exports = {
  login
}; 