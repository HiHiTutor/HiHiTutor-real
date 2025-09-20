const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 修復用戶文件數據同步問題
router.post('/fix-user-files/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔧 開始修復用戶文件數據:', userId);
    
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }
    
    console.log('🔍 找到用戶:', user.name);
    
    // 獲取當前數據
    const publicCerts = user.tutorProfile?.publicCertificates || [];
    const educationCerts = user.documents?.educationCert || [];
    
    console.log('📊 當前 publicCertificates 數量:', publicCerts.length);
    console.log('📊 當前 educationCert 數量:', educationCerts.length);
    
    // 如果 publicCertificates 有更多文件，同步到 educationCert
    if (publicCerts.length > educationCerts.length) {
      console.log('🔧 同步 publicCertificates 到 educationCert...');
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            'documents.educationCert': publicCerts
          }
        },
        { new: true }
      );
      
      console.log('✅ 數據同步完成!');
      console.log('📊 同步後 educationCert 數量:', updatedUser.documents.educationCert.length);
      
      return res.json({
        success: true,
        message: '文件數據同步成功',
        data: {
          userId: updatedUser.userId,
          publicCertificates: updatedUser.tutorProfile.publicCertificates,
          educationCert: updatedUser.documents.educationCert
        }
      });
    } else {
      console.log('ℹ️ 數據已同步，無需修復');
      return res.json({
        success: true,
        message: '數據已同步，無需修復',
        data: {
          userId: user.userId,
          publicCertificates: publicCerts,
          educationCert: educationCerts
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 修復用戶文件數據失敗:', error);
    res.status(500).json({
      success: false,
      message: '修復失敗',
      error: error.message
    });
  }
});

module.exports = router;
