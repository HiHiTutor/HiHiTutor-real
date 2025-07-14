const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  createUser, 
  getUserById, 
  updateUser,
  testUserIdGeneration,
  getAdminNotifications
} = require('../controllers/adminController');
const { login } = require('../controllers/adminAuthController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/auth/login', login);

// Protected routes
router.get('/users', verifyToken, getAllUsers);
router.post('/users', verifyToken, createUser);
router.get('/users/:id', verifyToken, getUserById);
router.put('/users/:id', verifyToken, updateUser);

// 測試端點
router.get('/test/userid-generation', verifyToken, testUserIdGeneration);

// 通知端點
router.get('/notifications', verifyToken, getAdminNotifications);

module.exports = router; 