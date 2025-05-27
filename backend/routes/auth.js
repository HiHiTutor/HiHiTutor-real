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
  requestTutorUpgrade
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', register);
router.get('/profile', verifyToken, getUserProfile);
router.get('/me', verifyToken, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/request-tutor-upgrade', verifyToken, requestTutorUpgrade);

module.exports = router; 