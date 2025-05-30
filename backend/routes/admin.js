const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  getSubjectStats,
  getPlatformStats
} = require('../controllers/adminController');

// User management routes
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.get('/users/:id/upgrade-documents', verifyToken, isAdmin, getUserUpgradeDocuments);
router.put('/users/:id/upgrade-status', verifyToken, isAdmin, approveUserUpgrade);
router.put('/users/:id/upgrade-reject', verifyToken, isAdmin, rejectUserUpgrade);

// Case management routes
router.get('/cases', verifyToken, isAdmin, getAllCases);
router.get('/cases/:id', verifyToken, isAdmin, getCaseById);
router.put('/cases/:id', verifyToken, isAdmin, updateCase);
router.patch('/cases/:id/status', verifyToken, isAdmin, updateCaseStatus);
router.patch('/cases/:id/promotion-status', verifyToken, isAdmin, updatePromotionLevel);

// Statistics routes
router.get('/statistics/subjects', verifyToken, isAdmin, getSubjectStats);
router.get('/statistics/platform', verifyToken, isAdmin, getPlatformStats);

module.exports = router; 