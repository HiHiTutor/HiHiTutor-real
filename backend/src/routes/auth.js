const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword
} = require('../controllers/authController');

// 公開路由（不需要驗證）
router.post('/login', loginUser);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);

// 需要驗證的路由
router.get('/profile', verifyToken, getUserProfile);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router; 