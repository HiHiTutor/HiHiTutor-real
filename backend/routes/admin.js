const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  getSubjectStats,
  getPlatformStats
} = require('../controllers/adminController');

// User management routes
router.post('/users', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.get('/users/:id/upgrade-documents', verifyToken, isAdmin, getUserUpgradeDocuments);
router.post('/users/:id/approve-upgrade', verifyToken, isAdmin, approveUserUpgrade);
router.post('/users/:id/reject-upgrade', verifyToken, isAdmin, rejectUserUpgrade);

// Case management routes
router.post('/cases', verifyToken, isAdmin, createCase);
router.get('/cases', verifyToken, isAdmin, getAllCases);
router.get('/cases/:id', verifyToken, isAdmin, getCaseById);
router.put('/cases/:id', verifyToken, isAdmin, updateCase);
router.put('/cases/:id/status', verifyToken, isAdmin, updateCaseStatus);
router.put('/cases/:id/promotion', verifyToken, isAdmin, updatePromotionLevel);

// Statistics routes
router.get('/statistics/subjects', verifyToken, isAdmin, getSubjectStats);
router.get('/statistics/platform', verifyToken, isAdmin, getPlatformStats);

module.exports = router; 