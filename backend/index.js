require('dotenv').config();

// 全域錯誤處理
process.on('uncaughtException', (err) => {
  console.error('[❌] 未捕獲的異常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[❌] 未處理的 Promise 拒絕:', reason);
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const tutorsRouter = require('./routes/tutors');
const caseRoutes = require('./routes/cases');
const categoryRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const hotSubjectRoutes = require('./routes/hotSubjects');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const tutorApplicationRoutes = require('./routes/tutorApplications');
const caseApplicationRoutes = require('./routes/caseApplications');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/user');
const studentCasesRouter = require('./routes/studentCases');
const tutorCasesRouter = require('./routes/tutorCases');

const app = express();
const port = process.env.PORT || 3001;

// 檢查環境變數
if (!process.env.JWT_SECRET) {
  console.error('[❌] 錯誤: JWT_SECRET 未設定');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[🔍] ${req.method} ${req.originalUrl}`);
  next();
});

// 基本路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 路由
app.use('/api/find-student-cases', studentCasesRouter);
app.use('/api/find-tutor-cases', tutorCasesRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', caseRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hot-subjects', hotSubjectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/tutor-applications', tutorApplicationRoutes);
app.use('/api/case-applications', caseApplicationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Mounted routes:');
  console.log('- /api/find-student-cases');
  console.log('- /api/find-tutor-cases');
  console.log('- /api/categories');
  console.log('- /api/tutors');
  console.log('- /api/cases');
  console.log('- /api/search');
  console.log('- /api/hot-subjects');
  console.log('- /api/auth');
  console.log('- /api/contact');
  console.log('- /api/tutor-applications');
  console.log('- /api/case-applications');
  console.log('- /api/applications');
  console.log('- /api/admin');
  console.log('- /api');
}); 