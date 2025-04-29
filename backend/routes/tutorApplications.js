const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const {
  submitTutorApplication,
  reviewTutorApplication,
  createTutorUser,
  getAllApplications
} = require('../controllers/tutorApplicationController');

// 用戶提交導師申請
router.post('/apply', verifyToken, submitTutorApplication);

// 管理員獲取所有申請記錄
router.get('/', verifyToken, verifyAdmin, getAllApplications);

// 管理員審核申請
router.put('/:applicationId/review', verifyToken, verifyAdmin, reviewTutorApplication);

// 管理員手動創建導師用戶
router.post('/create', verifyToken, verifyAdmin, createTutorUser);

module.exports = router; 