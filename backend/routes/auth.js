const express = require('express');
const router = express.Router();
const { loginUser, register, getUserProfile, getCurrentUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, getUserProfile);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router; 