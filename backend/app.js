const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Request timestamp logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority'
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// API Routes
app.use('/api/tutors', tutorsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cases', casesRouter);
app.use('/api/find-student-cases', findStudentCases);
app.use('/api/find-tutor-cases', findTutorCases);
app.use('/api/articles', articlesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faqs', faqRoutes);

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
console.log('- GET /api/tutor-cases');
console.log('- GET /api/tutor-cases/recommended');
console.log('- GET /api/find-tutor-cases');
console.log('- GET /api/categories');
console.log('- GET /api/tutors');
console.log('- GET /api/cases');
console.log('- POST /api/contact\n');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 