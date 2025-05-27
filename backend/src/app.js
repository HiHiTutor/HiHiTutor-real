const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { verifyToken } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');

// Import routes
const tutorCasesRouter = require('./routes/tutorCases');
const studentCasesRouter = require('./routes/studentCases');
const categoriesRouter = require('./routes/categories');
const tutorsRouter = require('./routes/tutors');
const casesRouter = require('./routes/cases');
const findTutorCases = require('./routes/findTutorCases');
const findStudentCases = require('./routes/findStudentCases');
const authRoutes = require('./routes/auth');
const meRouter = require('./routes/me');
const applicationRouter = require('./routes/applications');
const caseApplicationRouter = require('./routes/caseApplications');

// 連接數據庫
connectDB();

const app = express();

// 官方推薦簡化版 CORS 設定
const corsOptions = {
  origin: ['http://localhost:3000', 'https://hi-hi-tutor-real.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
};
app.use(cors(corsOptions));

// 添加 JSON 解析中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request timestamp logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
// 公開路由（不需要驗證）
app.use('/api/auth', authRoutes);

// 需要驗證的路由
app.use('/api/me', verifyToken, meRouter);
app.use('/api/applications', verifyToken, applicationRouter);
app.use('/api/case-applications', verifyToken, caseApplicationRouter);

// 其他路由
app.use('/api/tutor-cases', tutorCasesRouter);
app.use('/api/find-tutor-cases', findTutorCases);
app.use('/api/categories', categoriesRouter);
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/find-student-cases', findStudentCases);

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

// Log available routes on startup
console.log('\n可用的 API 路由:');
console.log('- POST /api/auth/login');
console.log('- POST /api/auth/register');
console.log('- POST /api/auth/forgot-password');
console.log('- GET /api/tutor-cases');
console.log('- GET /api/tutor-cases/recommended');
console.log('- GET /api/find-tutor-cases');
console.log('- GET /api/categories');
console.log('- GET /api/tutors');
console.log('- GET /api/cases\n');

module.exports = app; 