const mongoose = require('mongoose');
const User = require('./models/User');

async function testUserStatus() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 查找特定用戶
    const userId = '688334224593e6a0b99d6870';
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ 找不到用戶:', userId);
      return;
    }

    console.log('📋 用戶資料:');
    console.log('- ID:', user._id);
    console.log('- 姓名:', user.name);
    console.log('- 用戶類型:', user.userType);
    console.log('- 個人資料狀態:', user.profileStatus);
    console.log('- 導師ID:', user.tutorId);

    // 檢查pendingProfile
    if (user.pendingProfile) {
      console.log('📋 PendingProfile 資料:');
      console.log('- 狀態:', user.pendingProfile.status);
      console.log('- 姓名:', user.pendingProfile.name);
      console.log('- 電話:', user.pendingProfile.phone);
      console.log('- 電郵:', user.pendingProfile.email);
      console.log('- 提交時間:', user.pendingProfile.submittedAt);
      console.log('- 管理員備註:', user.pendingProfile.adminRemarks);
    } else {
      console.log('❌ 沒有 pendingProfile');
    }

    // 檢查tutorProfile
    if (user.tutorProfile) {
      console.log('📋 TutorProfile 資料:');
      console.log('- 姓名:', user.tutorProfile.name);
      console.log('- 性別:', user.tutorProfile.gender);
      console.log('- 科目:', user.tutorProfile.subjects);
    } else {
      console.log('❌ 沒有 tutorProfile');
    }

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testUserStatus(); 