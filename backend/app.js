console.log('🔥 App.js loaded: ', __filename);
// Deployment trigger: 2024-07-17-2 - CORS emergency fix
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 早期檢查 MONGODB_URI
console.log('🔍 檢查環境變數...');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI 未定義！');
  console.error('請在 Vercel 環境變數中設定 MONGODB_URI');
  console.error('或在本地 .env 文件中設定 MONGODB_URI');
  
  // 在 Vercel 環境中不要立即退出，讓應用繼續運行但會失敗
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
} else {
  console.log('✅ MONGODB_URI 已設定');
  // 遮蔽密碼顯示 URI 開頭
  const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv?:\/\/[^:]+:)[^@]+(@.*)/, '$1[PASSWORD]$2');
  console.log('- MONGODB_URI:', maskedUri);
}

const { connectDB, getConnectionStatus } = require('./config/db');

// Import routes
const tutorCasesRouter = require('./routes/tutorCases');
const categoriesRouter = require('./routes/categories');
const tutorsRouter = require('./routes/tutors');
const casesRouter = require('./routes/cases');
const findTutorCases = require('./routes/findTutorCases');
const findStudentCases = require('./routes/findStudentCases');
const articlesRoutes = require('./routes/articles');
// const contactRoutes = require('./routes/contact'); // 已廢除 contact 頁面
const faqRoutes = require('./routes/faq');
const authRoutes = require('./routes/auth');
const userRouter = require('./routes/user');
const applicationRouter = require('./routes/applications');
const caseApplicationRouter = require('./routes/caseApplications');
const regionsRouter = require('./routes/regions');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const tutorApplicationsRouter = require('./routes/tutorApplications');
const uploadRouter = require('./routes/upload');
const usersRouter = require('./routes/users');
const tutorProfilesRouter = require('./routes/tutorProfiles');
const searchRoutes = require('./routes/search');
const smsRoutes = require('./routes/sms');
const adRoutes = require('./routes/adRoutes');
const adminConfigRoutes = require('./routes/adminConfig');
const superAdminRoutes = require('./routes/superAdmin');
const fixIndexRoutes = require('./routes/fixIndex');
const teachingModesRouter = require('./routes/teachingModes');
const organizationTutorsRouter = require('./routes/organizationTutors');

const app = express();

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code
  });
  // Don't exit the process on Vercel
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', {
    reason: typeof reason === 'object' ? {
      message: reason.message,
      stack: reason.stack,
      name: reason.name,
      code: reason.code
    } : reason,
    promise: promise
  });
});

// Enhanced request logging
morgan.token('request-body', (req) => {
  const body = {...req.body};
  if (body.password) {
    body.password = '[HIDDEN]';
  }
  return JSON.stringify(body);
});

app.use(morgan(':method :url :status :response-time ms - :request-body'));

// CORS configuration - Simplified for immediate fix
app.use(cors({
  origin: true, // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

// Handle OPTIONS preflight requests for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('🔥 OPTIONS preflight request from origin:', origin);
  
  // Allow all origins for now (since we're using origin: true in cors config)
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  console.log('✅ OPTIONS preflight allowed for origin:', origin);
  res.sendStatus(204);
});

// Body parsing middleware - BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  console.log("🔥 GLOBAL MIDDLEWARE HIT:", req.method, req.originalUrl);
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  
  // 🔥 調試日誌：檢查 req.body
  console.log('🔥 req.body =', req.body);
  console.log('🔥 req.headers["content-type"] =', req.headers['content-type']);
  
  console.log(`[${requestId}] 📝 Request received:`, {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin'],
      'authorization': req.headers['authorization'] ? 'Bearer [hidden]' : 'none'
    },
    body: req.method !== 'GET' ? (
      req.body && req.body.password ? {...req.body, password: '[HIDDEN]'} : req.body
    ) : undefined,
    query: req.query,
    ip: req.ip
  });

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Capture response
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`[${requestId}] 📤 Response:`, {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: typeof data === 'string' ? data : JSON.stringify(data)
    });
    oldSend.apply(res, arguments);
  };

  next();
});

// Connect to MongoDB
connectDB();

// Monitor MongoDB connection (避免重複監聽器)
if (!mongoose.connection.listeners('connected').length) {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });
}

if (!mongoose.connection.listeners('error').length) {
  mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
  });
}

if (!mongoose.connection.listeners('disconnected').length) {
  mongoose.connection.on('disconnected', () => {
    console.log('🔄 MongoDB disconnected, attempting to reconnect...');
    // 避免重複連接，檢查當前狀態
    if (mongoose.connection.readyState === 0) {
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        connectDB();
      }, 5000);
    }
  });
}

// Mount routes
app.use('/api/auth', authRoutes);
console.log("✅ authRoutes loaded and mounted");
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-management', require('./routes/admin'));
app.use('/api/categories', categoriesRouter);
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/find-tutor-cases', findTutorCases);
app.use('/api/find-student-cases', findStudentCases);
app.use('/api/tutor-cases', tutorCasesRouter);
app.use('/api/user', userRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/case-applications', caseApplicationRouter);
// app.use('/api/contact', contactRoutes); // 已廢除 contact 頁面
app.use('/api/faq', faqRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/regions', regionsRouter);
app.use('/api/tutor-applications', tutorApplicationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);
app.use('/api/tutor-profiles', tutorProfilesRouter);
app.use('/api/files', require('./routes/files'));
app.use('/api/search', searchRoutes);
app.use('/api/debug', require('./routes/debug'));
app.use('/api/sms', smsRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/admin/config', adminConfigRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/fix', fixIndexRoutes);
app.use('/api/teaching-modes', teachingModesRouter);
app.use('/api/organization-tutors', organizationTutorsRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI
    }
  });
});

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus
    };

    // 如果數據庫連接，嘗試簡單查詢
    if (mongoose.connection.readyState === 1) {
      try {
        const StudentCase = require('./models/StudentCase');
        const count = await StudentCase.countDocuments();
        health.database.testQuery = {
          success: true,
          studentCaseCount: count
        };
      } catch (dbError) {
        health.database.testQuery = {
          success: false,
          error: dbError.message
        };
      }
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] 找不到路由: ${req.method} ${req.url}`);
  res.status(404).json({ message: '找不到請求的資源' });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  const requestId = res.getHeader('X-Request-ID') || req.headers['x-vercel-id'] || Date.now().toString();
  
  console.error(`[${requestId}] ❌ Global error handler:`, {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'origin': req.headers['origin'],
        'user-agent': req.headers['user-agent']
      },
      body: req.method !== 'GET' ? (
        req.body && req.body.password ? {...req.body, password: '[HIDDEN]'} : req.body
      ) : undefined
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongooseState: mongoose.connection.readyState
    }
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    debug: {
      requestId,
      error: err.name,
      type: err.constructor.name,
      env: process.env.NODE_ENV,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
});

// Log available routes
console.log('Available API routes:');
console.log('- GET /api/auth/profile');
console.log('- GET /api/categories');
console.log('- GET /api/tutors');
console.log('- GET /api/tutors/recommended');
console.log('- GET /api/find-tutor-cases');
console.log('- GET /api/find-tutor-cases?featured=true&limit=8');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 