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
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Auth routes
router.post('/auth/login', login);

// Protected routes - 需要管理員權限
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.post('/users', verifyToken, isAdmin, createUser);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.put('/users/:id', verifyToken, isAdmin, updateUser);

// 測試端點
router.get('/test/userid-generation', verifyToken, isAdmin, testUserIdGeneration);

// 通知端點
router.get('/notifications', verifyToken, isAdmin, getAdminNotifications);

module.exports = router; 