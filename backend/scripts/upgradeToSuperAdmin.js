const mongoose = require('mongoose');
const User = require('../models/User');

async function upgradeToSuperAdmin() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找用戶 60761408
    let user = await User.findOne({ phone: '60761408' });
    
    if (!user) {
      console.log('❌ User not found with phone: 60761408');
      console.log('🔍 Searching for user with different identifiers...');
      
      // 嘗試其他可能的查找方式
      const userById = await User.findOne({ userId: '60761408' });
      if (userById) {
        console.log('✅ Found user by userId:', userById.phone);
        user = userById;
      } else {
        console.log('❌ User not found with any identifier: 60761408');
        return;
      }
    }

    console.log('🔍 Current user status:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userId: user.userId,
      userType: user.userType,
      role: user.role,
      status: user.status
    });

    // 檢查是否已經是超級管理員
    if (user.role === 'super_admin' && user.userType === 'super_admin') {
      console.log('⚠️ User is already a super admin');
      return;
    }

    // 升級為超級管理員
    user.userType = 'super_admin';
    user.role = 'super_admin';
    user.status = 'active';
    
    await user.save();
    
    console.log('✅ User upgraded to super admin successfully:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userId: user.userId,
      userType: user.userType,
      role: user.role,
      status: user.status
    });

    // 驗證更新
    const updatedUser = await User.findOne({ phone: user.phone });
    console.log('🔍 Verification - Updated user:', {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      userId: updatedUser.userId,
      userType: updatedUser.userType,
      role: updatedUser.role,
      status: updatedUser.status
    });

    console.log('🎉 User 60761408 has been successfully upgraded to Super Admin!');

  } catch (error) {
    console.error('❌ Error upgrading user to super admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  upgradeToSuperAdmin();
}

module.exports = upgradeToSuperAdmin; 