const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminController');
const { login } = require('../controllers/adminAuthController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/auth/login', login);

// Protected routes
router.get('/users', verifyToken, getAllUsers);

module.exports = router; 