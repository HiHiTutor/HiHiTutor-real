// Deployment trigger: 2024-03-22-1
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const tutorCasesRouter = require('./routes/tutorCases');
const studentCasesRouter = require('./routes/studentCases');
const categoriesRouter = require('./routes/categories');
const tutorsRouter = require('./routes/tutors');
const casesRouter = require('./routes/cases');
const findTutorCases = require('./routes/findTutorCases');
const findStudentCases = require('./routes/findStudentCases');
const articlesRoutes = require('./routes/articles');
const contactRoutes = require('./routes/contact');
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

// CORS configuration
app.use(cors({
  origin: [
    'https://hi-hi-tutor-real.vercel.app',
    'https://hi-hi-tutor-real-admin-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ], // 測試階段先允許全部，正式可限制 https://hi-hi-tutor-real.vercel.app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Handle OPTIONS preflight requests for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Body parsing middleware - BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
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
      req.body.password ? {...req.body, password: '[HIDDEN]'} : req.body
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

// Monitor MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  connectDB();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-management', require('./routes/admin'));
app.use('/api/categories', categoriesRouter);
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/find-student-cases', findStudentCases);
app.use('/api/student-cases', studentCasesRouter);
app.use('/api/find-tutor-cases', findTutorCases);
app.use('/api/tutor-cases', tutorCasesRouter);
app.use('/api/user', userRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/case-applications', caseApplicationRouter);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/regions', regionsRouter);
app.use('/api/tutor-applications', tutorApplicationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);
app.use('/api/tutor-profiles', tutorProfilesRouter);
app.use('/api/files', require('./routes/files'));
app.use('/api/search', searchRoutes);

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
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        stateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      }
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
        req.body.password ? {...req.body, password: '[HIDDEN]'} : req.body
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
console.log('- GET /api/find-student-cases');
console.log('- GET /api/find-tutor-cases');
console.log('- GET /api/find-student-cases?featured=true&limit=8');
console.log('- GET /api/find-tutor-cases?featured=true&limit=8');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 