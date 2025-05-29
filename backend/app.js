const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
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

const app = express();

// CORS 設定
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',  // 添加管理員前端
      'https://hi-hi-tutor-real.vercel.app',
      'https://hi-hi-tutor-real-git-main-hihitutor.vercel.app',
      /\.vercel\.app$/
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 確保請求體解析中間件在 CORS 之後
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request timestamp logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 連接 MongoDB
connectDB();

// 監聽連線狀態
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  connectDB();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/find-student-cases', findStudentCases);
app.use('/api/find-tutor-cases', findTutorCases);
app.use('/api/user', userRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/case-applications', caseApplicationRouter);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/regions', regionsRouter);

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

// Error handler
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ message: '伺服器發生錯誤，請稍後再試' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 