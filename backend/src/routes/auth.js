const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword,
  sendVerificationCode,
  verifyCode
} = require('../controllers/authController');

// 公開路由（不需要驗證）
router.post('/login', loginUser);
router.post('/register', register);
router.post('/request-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);

// 需要驗證的路由
router.get('/me', verifyToken, getCurrentUser);
router.get('/profile', verifyToken, getUserProfile);

module.exports = router; 