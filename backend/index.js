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
const tutorsRouter = require('./routes/tutors');
const caseRoutes = require('./routes/cases');
const tutorCaseRoutes = require('./routes/tutorCases');
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

// Request Logger Middleware
app.use((req, res, next) => {
  // 只有認證相關的請求才顯示詳細日誌
  if (req.path.startsWith('/api/auth/')) {
    // 認證相關請求保持原有的詳細日誌
    console.log(`[🔍] ${req.method} ${req.originalUrl}`);
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };
      if (safeBody.password) delete safeBody.password;
      console.log(`[🧾] Body:`, safeBody);
    }
  } else {
    // 其他請求只顯示簡單的路徑資訊
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Routes
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', caseRoutes);
app.use('/api/tutor-cases', tutorCaseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hot-subjects', hotSubjectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/tutors', tutorApplicationRoutes);
app.use('/api/cases', caseApplicationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('[❌] API 錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`[✅] Backend 正在監聽 http://localhost:${port}`);
  console.log(`[ℹ️] JWT_SECRET 已載入: ${process.env.JWT_SECRET ? '是' : '否'}`);
}); 