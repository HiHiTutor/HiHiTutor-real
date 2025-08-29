const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  approveOrganization,
  rejectOrganization,
  getAllOrganizations,
  getOrganizationDetails,
  approveOrganizationTutor,
  rejectOrganizationTutor,
  getAllSubscriptions,
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  getSubjectStats,
  getPlatformStats,
  getSearchStats,
  getMatchingStats,
  getPendingStudentCases,
  approveStudentCase,
  rejectStudentCase
} = require('../controllers/adminController');
const User = require('../models/User'); // Added missing import for User model
const bcrypt = require('bcryptjs'); // Added missing import for bcrypt
const TutorApplication = require('../models/TutorApplication');
const Case = require('../models/Case');
const StudentCase = require('../models/StudentCase');

// Notifications route
router.get('/notifications', verifyToken, isAdmin, async (req, res) => {
  try {
    // 統計待審核的導師資料
    const pendingTutorProfiles = await User.countDocuments({ 
      userType: 'tutor',
      profileStatus: 'pending'
    });
    
    // 統計待審核的導師申請
    const pendingTutorApplications = await TutorApplication.countDocuments({ status: 'pending' });
    
    // 統計待升級的用戶
    const pendingUserUpgrades = await User.countDocuments({ 
      upgradeRequest: { $exists: true, $ne: null },
      upgradeStatus: 'pending'
    });
    
    // 統計待審核的機構用戶
    const pendingOrganizationUsers = await User.countDocuments({ 
      userType: 'organization',
      status: 'pending'
    });
    
    // 統計開放中的個案
    const openCases = await Case.countDocuments({ status: 'open' });
    
    // 統計待審批的學生案例
    const pendingStudentCases = await StudentCase.countDocuments({ isApproved: false });
    
    const notifications = {
      total: pendingTutorProfiles + pendingTutorApplications + pendingUserUpgrades + pendingOrganizationUsers + openCases + pendingStudentCases,
      pendingTutorProfiles,
      pendingTutorApplications,
      pendingUserUpgrades,
      pendingOrganizationUsers,
      openCases,
      pendingStudentCases,
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
router.delete('/users/:id', verifyToken, isAdmin, deleteUser); // 只有超級管理員可以刪除用戶
router.get('/users/:id/upgrade-documents', verifyToken, isAdmin, getUserUpgradeDocuments);
router.post('/users/:id/approve-upgrade', verifyToken, isAdmin, approveUserUpgrade);
router.post('/users/:id/reject-upgrade', verifyToken, isAdmin, rejectUserUpgrade);
router.post('/users/:id/approve-organization', verifyToken, isAdmin, approveOrganization);
router.post('/users/:id/reject-organization', verifyToken, isAdmin, rejectOrganization);

// 機構管理
router.get('/organizations', verifyToken, isAdmin, getAllOrganizations);
router.get('/organizations/:id', verifyToken, isAdmin, getOrganizationDetails);
router.post('/organization-tutors/:tutorId/approve', verifyToken, isAdmin, approveOrganizationTutor);
router.post('/organization-tutors/:tutorId/reject', verifyToken, isAdmin, rejectOrganizationTutor);
router.get('/subscriptions', verifyToken, isAdmin, getAllSubscriptions);

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

// 新增：檢查和修復導師VIP/置頂狀態
router.get('/fix-tutor-status', async (req, res) => {
  try {
    console.log('🔧 開始檢查和修復導師狀態...');
    
    // 獲取所有導師
    const allTutors = await User.find({ 
      userType: 'tutor',
      isActive: true,
      status: 'active'
    }).sort({ rating: -1 });
    
    console.log(`📊 找到 ${allTutors.length} 個活躍導師`);
    
    // 檢查當前VIP和置頂導師數量
    const vipCount = allTutors.filter(t => t.isVip).length;
    const topCount = allTutors.filter(t => t.isTop).length;
    
    console.log(`📈 當前狀態: VIP=${vipCount}, 置頂=${topCount}`);
    
    // 如果沒有VIP或置頂導師，自動設置
    if (vipCount === 0 && topCount === 0 && allTutors.length > 0) {
      console.log('🔄 沒有VIP或置頂導師，開始自動設置...');
      
      const updates = [];
      
      // 設置前3個為VIP
      for (let i = 0; i < Math.min(3, allTutors.length); i++) {
        const tutor = allTutors[i];
        if (!tutor.isVip) {
          updates.push({
            updateOne: {
              filter: { _id: tutor._id },
              update: { 
                $set: { 
                  isVip: true, 
                  isTop: false 
                } 
              }
            }
          });
          console.log(`✅ 設置 ${tutor.tutorId || tutor.name} 為VIP`);
        }
      }
      
      // 設置接下來5個為置頂
      for (let i = 3; i < Math.min(8, allTutors.length); i++) {
        const tutor = allTutors[i];
        if (!tutor.isTop) {
          updates.push({
            updateOne: {
              filter: { _id: tutor._id },
              update: { 
                $set: { 
                  isTop: true, 
                  isVip: false 
                } 
              }
            }
          });
          console.log(`✅ 設置 ${tutor.tutorId || tutor.name} 為置頂`);
        }
      }
      
      // 批量更新資料庫
      if (updates.length > 0) {
        const result = await User.bulkWrite(updates);
        console.log(`🎉 成功更新 ${result.modifiedCount} 個導師`);
      }
    }
    
    // 重新獲取更新後的導師列表
    const updatedTutors = await User.find({ 
      userType: 'tutor',
      isActive: true,
      status: 'active'
    }).sort({ rating: -1 }).limit(10);
    
    const finalVipCount = updatedTutors.filter(t => t.isVip).length;
    const finalTopCount = updatedTutors.filter(t => t.isTop).length;
    
    console.log(`📊 修復後狀態: VIP=${finalVipCount}, 置頂=${finalTopCount}`);
    
    res.json({
      success: true,
      message: '導師狀態修復完成',
      before: { vip: vipCount, top: topCount },
      after: { vip: finalVipCount, top: finalTopCount },
      topTutors: updatedTutors.slice(0, 5).map(t => ({
        tutorId: t.tutorId,
        name: t.name,
        rating: t.rating,
        isVip: t.isVip,
        isTop: t.isTop
      }))
    });
    
  } catch (error) {
    console.error('❌ 修復導師狀態時出錯:', error);
    res.status(500).json({
      success: false,
      message: '修復導師狀態時出錯',
      error: error.message
    });
  }
});

// 新增：檢查導師資料庫狀態
router.get('/check-tutor-status', async (req, res) => {
  try {
    console.log('🔍 檢查導師資料庫狀態...');
    
    // 獲取所有導師
    const allTutors = await User.find({ 
      userType: 'tutor',
      isActive: true,
      status: 'active'
    }).sort({ rating: -1 });
    
    console.log(`📊 找到 ${allTutors.length} 個活躍導師`);
    
    // 檢查VIP和置頂導師
    const vipTutors = allTutors.filter(t => t.isVip);
    const topTutors = allTutors.filter(t => t.isTop);
    
    console.log(`📈 VIP導師: ${vipTutors.length} 個`);
    console.log(`📈 置頂導師: ${topTutors.length} 個`);
    
    // 顯示前10個導師的詳細信息
    const top10Tutors = allTutors.slice(0, 10).map(t => ({
      tutorId: t.tutorId,
      name: t.name,
      rating: t.rating,
      isVip: t.isVip,
      isTop: t.isTop,
      userType: t.userType,
      isActive: t.isActive,
      status: t.status
    }));
    
    res.json({
      success: true,
      totalTutors: allTutors.length,
      vipCount: vipTutors.length,
      topCount: topTutors.length,
      top10Tutors: top10Tutors,
      vipTutors: vipTutors.map(t => ({ tutorId: t.tutorId, name: t.name, rating: t.rating })),
      topTutors: topTutors.map(t => ({ tutorId: t.tutorId, name: t.name, rating: t.rating }))
    });
    
  } catch (error) {
    console.error('❌ 檢查導師狀態時出錯:', error);
    res.status(500).json({
      success: false,
      message: '檢查導師狀態時出錯',
      error: error.message
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

// 學生案例審批路由
router.get('/pending-student-cases', verifyToken, isAdmin, getPendingStudentCases);
router.put('/student-cases/:id/approve', verifyToken, isAdmin, approveStudentCase);
router.put('/student-cases/:id/reject', verifyToken, isAdmin, rejectStudentCase);

// Statistics routes
router.get('/statistics/subjects', verifyToken, isAdmin, getSubjectStats);
router.get('/statistics/platform', verifyToken, isAdmin, getPlatformStats);
router.get('/statistics/search', verifyToken, isAdmin, getSearchStats);
router.get('/statistics/matching', verifyToken, isAdmin, getMatchingStats);

module.exports = router; 