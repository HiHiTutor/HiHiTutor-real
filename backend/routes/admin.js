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
  getPlatformStats,
  getSearchStats,
  getMatchingStats
} = require('../controllers/adminController');
const User = require('../models/User'); // Added missing import for User model
const bcrypt = require('bcryptjs'); // Added missing import for bcrypt

// User management routes
router.post('/users', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.get('/users/:id/upgrade-documents', verifyToken, isAdmin, getUserUpgradeDocuments);
router.post('/users/:id/approve-upgrade', verifyToken, isAdmin, approveUserUpgrade);
router.post('/users/:id/reject-upgrade', verifyToken, isAdmin, rejectUserUpgrade);

// 臨時端點：修復用戶 90767559 的密碼
router.post('/fix-user-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    
    if (!phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '請提供電話號碼和新密碼'
      });
    }

    // 只允許修復特定用戶
    if (phone !== '90767559') {
      return res.status(403).json({
        success: false,
        message: '只能修復特定用戶的密碼'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    // 重新加密密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 更新密碼
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password fixed for user:', phone);

    res.json({
      success: true,
      message: '密碼修復成功',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error fixing password:', error);
    res.status(500).json({
      success: false,
      message: '修復密碼時發生錯誤'
    });
  }
});

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
router.get('/statistics/search', verifyToken, isAdmin, getSearchStats);
router.get('/statistics/matching', verifyToken, isAdmin, getMatchingStats);

module.exports = router; 