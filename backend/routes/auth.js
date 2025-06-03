const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  register, 
  getUserProfile, 
  getCurrentUser, 
  forgotPassword, 
  resetPassword,
  updateUserProfile,
  requestTutorUpgrade,
  sendVerificationCode,
  verifyCode,
  verifyPassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', register);
router.post('/request-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/request-tutor-upgrade', verifyToken, requestTutorUpgrade);
router.get('/me', verifyToken, getCurrentUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-password', verifyToken, verifyPassword);

module.exports = router; 