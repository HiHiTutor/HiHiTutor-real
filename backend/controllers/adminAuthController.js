const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const login = async (req, res) => {
  const requestId = res.getHeader('X-Request-ID') || Date.now().toString();
  
  try {
    // Log request details (sanitized)
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
      path: req.path
    });

    // Basic request validation
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: '無效的請求格式',
        debug: { 
          hasBody: !!req.body,
          bodyType: typeof req.body
        }
      });
    }

    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      console.log(`[${requestId}] ❌ Login failed: Missing credentials`);
      return res.status(400).json({
        success: false,
        message: '請提供帳號與密碼',
        debug: { 
          hasIdentifier: !!identifier, 
          hasPassword: !!password 
        }
      });
    }

    // Environment check
    const jwtSecret = process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET;
    if (!jwtSecret) {
      console.error(`[${requestId}] ❌ Critical error: No JWT secret found`);
      return res.status(500).json({
        success: false,
        message: '伺服器配置錯誤',
        debug: {
          hasJwtSecret: false,
          env: process.env.NODE_ENV
        }
      });
    }

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
          message: '資料庫連接失敗',
          debug: {
            error: dbError.message,
            mongoState: mongoose.connection.readyState
          }
        });
      }
    }

    // Find user with safe error handling
    let user;
    try {
      // Validate identifier format
      if (typeof identifier !== 'string' || identifier.length < 3) {
        return res.status(400).json({
          success: false,
          message: '無效的帳號格式',
          debug: { 
            identifierType: typeof identifier,
            identifierLength: identifier?.length 
          }
        });
      }

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
          message: '帳號或密碼錯誤'
        });
      }

      // Verify admin status
      if (!user.userType || !user.role || 
          (user.userType !== 'admin' && user.userType !== 'super_admin') || 
          (user.role !== 'admin' && user.role !== 'super_admin')) {
        console.log(`[${requestId}] ❌ Non-admin user attempted login:`, {
          userType: user.userType,
          role: user.role
        });
        return res.status(403).json({
          success: false,
          message: '拒絕訪問。需要管理員權限。'
        });
      }

      // Verify password with safe error handling
      if (!user.password) {
        console.error(`[${requestId}] ❌ User has no password hash`);
        return res.status(500).json({
          success: false,
          message: '帳號配置錯誤'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '帳號或密碼錯誤'
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
      console.log(`[${requestId}] ✅ Login successful for user:`, user._id);
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
        message: '資料庫錯誤',
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
      message: '內部伺服器錯誤',
      debug: {
        error: error.message,
        type: error.name
      }
    });
  }
};

module.exports = {
  login
}; 