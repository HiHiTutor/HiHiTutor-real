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
const TutorApplication = require('../models/TutorApplication');
const Case = require('../models/Case');

// Notifications route
router.get('/notifications', verifyToken, isAdmin, async (req, res) => {
  try {
    // 統計待審核的導師資料（暫時設為0，因為冇TutorProfile model）
    const pendingTutorProfiles = 0;
    
    // 統計待審核的導師申請
    const pendingTutorApplications = await TutorApplication.countDocuments({ status: 'pending' });
    
    // 統計待升級的用戶
    const pendingUserUpgrades = await User.countDocuments({ 
      upgradeRequest: { $exists: true, $ne: null },
      upgradeStatus: 'pending'
    });
    
    // 統計開放中的個案
    const openCases = await Case.countDocuments({ status: 'open' });
    
    const notifications = {
      total: pendingTutorProfiles + pendingTutorApplications + pendingUserUpgrades + openCases,
      pendingTutorProfiles,
      pendingTutorApplications,
      pendingUserUpgrades,
      openCases,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: '獲取通知數據時發生錯誤'
    });
  }
});

// User management routes
router.post('/users', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.put('/users/:id', verifyToken, isAdmin, updateUser);
router.get('/users/:id/upgrade-documents', verifyToken, isAdmin, getUserUpgradeDocuments);
router.post('/users/:id/approve-upgrade', verifyToken, isAdmin, approveUserUpgrade);
router.post('/users/:id/reject-upgrade', verifyToken, isAdmin, rejectUserUpgrade);

// 臨時端點：修復用戶 90767559 的密碼（不需要認證）
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