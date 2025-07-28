const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetUserStatus() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 重置特定用戶的狀態
    const userId = '688334224593e6a0b99d6870';
    const userEmail = 'try725@example.com';
    
    console.log(`🔍 重置用戶狀態: ${userId} (${userEmail})`);
    
    // 查找用戶
    const user = await User.findById(userId);
    
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
      remarks: user.remarks
    });

    // 重置狀態為 pending
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profileStatus: 'pending',
          remarks: '重置為待審批狀態'
        }
      },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ 用戶狀態已重置:', {
        id: updatedUser._id,
        name: updatedUser.name,
        profileStatus: updatedUser.profileStatus,
        remarks: updatedUser.remarks
      });
    } else {
      console.log('❌ 重置失敗');
    }

    await mongoose.disconnect();
    console.log('✅ 數據庫連接已關閉');
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

resetUserStatus(); 