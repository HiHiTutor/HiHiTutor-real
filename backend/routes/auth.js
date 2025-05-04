const express = require('express');
const router = express.Router();
const { loginUser, register, getUserProfile, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', register);
router.get('/profile', verifyToken, getUserProfile);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router; 