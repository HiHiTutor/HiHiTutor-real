const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkSpecificUser() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 檢查特定用戶
    const userId = '688334224593e6a0b99d6870';
    const userEmail = 'try725@example.com';
    
    console.log(`🔍 檢查用戶: ${userId} (${userEmail})`);
    
    const user = await User.findById(userId).select('-password');
    
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

    // 檢查是否有其他相關記錄
    const allUsers = await User.find({
      $or: [
        { email: userEmail },
        { name: { $regex: user.name, $options: 'i' } }
      ]
    }).select('_id userId tutorId name email profileStatus createdAt');

    console.log('🔍 相關用戶記錄:');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.name} (${u.email}) - Status: ${u.profileStatus} - Created: ${u.createdAt}`);
    });

    await mongoose.disconnect();
    console.log('✅ 數據庫連接已關閉');
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

checkSpecificUser(); 