const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const {
  submitTutorApplication,
  reviewTutorApplication,
  approveTutorApplication,
  createTutorUser,
  getAllApplications,
  getAllTutorApplications
} = require('../controllers/tutorApplicationController');

// 測試路由（不需要認證）
router.post('/test', (req, res) => {
  console.log('🧪 測試路由被調用');
  console.log('請求頭:', req.headers);
  console.log('請求體:', req.body);
  res.json({ success: true, message: '測試路由工作正常' });
});

// 暫時移除認證來測試數據格式
router.post('/apply', (req, res, next) => {
  console.log('🧪 申請路由被調用');
  console.log('請求頭:', req.headers);
  console.log('請求體類型:', typeof req.body);
  console.log('請求體:', req.body);
  console.log('文件:', req.files);
  
  // 手動設置用戶ID用於測試
  req.user = { id: 'test-user-id' };
  next();
}, submitTutorApplication);

// 管理員獲取所有申請記錄（只允許 admin）
router.get('/', verifyToken, verifyAdmin, getAllTutorApplications);

// 管理員審核申請
router.put('/:id/review', verifyToken, verifyAdmin, reviewTutorApplication);

// 管理員批准申請
router.patch('/:id/approve', verifyToken, verifyAdmin, approveTutorApplication);

// 管理員手動創建導師用戶
router.post('/create', verifyToken, verifyAdmin, createTutorUser);

module.exports = router; 