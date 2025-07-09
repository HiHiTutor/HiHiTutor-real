'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
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
const findTutorCasesRouter = require('./routes/findTutorCases');
const studentCasesRouter = require('./routes/studentCases');
const tutorCasesRouter = require('./routes/tutorCases');
const upload = require('./uploadMiddleware');
const { verifyToken } = require('./middleware/authMiddleware');
const regionsRouter = require('./routes/regions');
const articlesRoutes = require('./routes/articles');
const faqRoutes = require('./routes/faq');

const app = express();
const port = process.env.PORT || 3001;

console.log('🧪 MONGODB_URI from env:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Error details:', err);
  process.exit(1); // 如果無法連線到資料庫，終止應用程式
});

// 監聽資料庫連線事件
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// 全域錯誤處理
process.on('uncaughtException', (err) => {
  console.error('[❌] 未捕獲的異常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[❌] 未處理的 Promise 拒絕:', reason);
});

// Middleware
app.use(cors({
  origin: 'https://hi-hi-tutor-real.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use('/api/find-tutor-cases', findTutorCasesRouter);
app.use('/api/tutor-cases', tutorCasesRouter);
app.use('/api/find-student-cases', studentCasesRouter);
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
app.use('/api/admin-management', require('./routes/admin'));
app.use('/api', userRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/regions', regionsRouter);
app.use('/api/articles', articlesRoutes);
app.use('/api/faqs', faqRoutes);
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const uploadedFiles = req.files;
    const userId = (req.body && req.body.userId) || 'unknown';
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Upload failed' });
    }
    // 回傳所有檔案的資訊
    res.json({
      success: true,
      files: uploadedFiles.map(f => ({
        filename: f.filename,
        url: `/uploads/${userId}/${f.filename}`
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 必須匯出 app 供 Vercel 使用
module.exports = app; 