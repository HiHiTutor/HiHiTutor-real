const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUserStatus() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 檢查特定用戶（根據日誌中的信息）
    const userEmail = 'try725@example.com';
    const userName = '兩歲半大壽';
    
    console.log(`🔍 檢查用戶: ${userName} (${userEmail})`);
    
    const user = await User.findOne({ 
      $or: [
        { email: userEmail },
        { name: userName }
      ]
    }).select('-password');
    
    if (!user) {
      console.log('❌ 找不到用戶');
      return;
    }
    
    console.log('✅ 找到用戶:', {
      id: user._id,
      userId: user.userId,
      tutorId: user.tutorId,
      name: user.name,
      email: user.email,
      userType: user.userType,
      profileStatus: user.profileStatus,
      remarks: user.remarks,
      pendingProfile: user.pendingProfile ? {
        status: user.pendingProfile.status,
        name: user.pendingProfile.name,
        adminRemarks: user.pendingProfile.adminRemarks
      } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    
    // 檢查是否有待審批的資料
    if (user.pendingProfile) {
      console.log('📋 待審批資料:', {
        status: user.pendingProfile.status,
        name: user.pendingProfile.name,
        submittedAt: user.pendingProfile.submittedAt,
        adminRemarks: user.pendingProfile.adminRemarks
      });
    }
    
    // 檢查 tutorProfile 狀態
    if (user.tutorProfile) {
      console.log('🎓 導師資料:', {
        applicationStatus: user.tutorProfile.applicationStatus,
        subjects: user.tutorProfile.subjects,
        educationLevel: user.tutorProfile.educationLevel,
        teachingExperienceYears: user.tutorProfile.teachingExperienceYears
      });
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

checkUserStatus(); 