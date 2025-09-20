// 文件同步 API 路由
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { syncUserFileFields, checkFileFieldsConsistency, getFileFieldsDifference } = require('../utils/fileSyncUtils');

// 同步單個用戶的文件字段
router.post('/users/:userId/sync', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { sourceField = 'educationCert' } = req.body;
    
    console.log(`🔧 同步用戶文件字段: ${userId}, 源字段: ${sourceField}`);
    
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }
    
    // 檢查同步前的一致性
    const beforeSync = checkFileFieldsConsistency(user);
    console.log('同步前狀態:', beforeSync);
    
    // 同步文件字段
    const syncedUser = syncUserFileFields(user, sourceField);
    
    // 保存更新
    await syncedUser.save();
    
    // 檢查同步後的一致性
    const afterSync = checkFileFieldsConsistency(syncedUser);
    console.log('同步後狀態:', afterSync);
    
    res.json({
      success: true,
      message: '文件字段同步成功',
      data: {
        userId: syncedUser.userId,
        userName: syncedUser.name,
        beforeSync,
        afterSync,
        sourceField
      }
    });
    
  } catch (error) {
    console.error('同步用戶文件字段失敗:', error);
    res.status(500).json({
      success: false,
      message: '同步失敗',
      error: error.message
    });
  }
});

// 檢查用戶文件字段一致性
router.get('/users/:userId/consistency', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }
    
    // 檢查一致性
    const consistency = checkFileFieldsConsistency(user);
    const differences = getFileFieldsDifference(user);
    
    res.json({
      success: true,
      data: {
        userId: user.userId,
        userName: user.name,
        consistency,
        differences
      }
    });
    
  } catch (error) {
    console.error('檢查文件字段一致性失敗:', error);
    res.status(500).json({
      success: false,
      message: '檢查失敗',
      error: error.message
    });
  }
});

// 同步所有導師用戶的文件字段
router.post('/sync-all-tutors', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sourceField = 'educationCert' } = req.body;
    
    console.log(`🔧 同步所有導師用戶文件字段, 源字段: ${sourceField}`);
    
    // 查找所有導師用戶
    const tutors = await User.find({ 
      userType: 'tutor',
      'tutorProfile.publicCertificates': { $exists: true }
    }).select('userId name');
    
    console.log(`找到 ${tutors.length} 個導師用戶`);
    
    const results = [];
    
    for (const tutor of tutors) {
      try {
        const user = await User.findOne({ userId: tutor.userId });
        if (user) {
          const beforeSync = checkFileFieldsConsistency(user);
          const syncedUser = syncUserFileFields(user, sourceField);
          await syncedUser.save();
          const afterSync = checkFileFieldsConsistency(syncedUser);
          
          results.push({
            userId: tutor.userId,
            name: tutor.name,
            success: true,
            beforeSync,
            afterSync,
            synced: !beforeSync.consistent
          });
        }
      } catch (error) {
        results.push({
          userId: tutor.userId,
          name: tutor.name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const syncedCount = results.filter(r => r.synced).length;
    
    res.json({
      success: true,
      message: `同步完成: ${successCount}/${tutors.length} 個用戶成功, ${syncedCount} 個需要同步`,
      data: {
        totalTutors: tutors.length,
        successCount,
        syncedCount,
        results
      }
    });
    
  } catch (error) {
    console.error('同步所有導師用戶文件字段失敗:', error);
    res.status(500).json({
      success: false,
      message: '同步失敗',
      error: error.message
    });
  }
});

module.exports = router;
