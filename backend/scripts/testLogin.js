const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找用戶
    const user = await User.findOne({ phone: '60761408' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('🔍 User found:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      status: user.status
    });

    // 檢查權限
    const isAdmin = user.userType === 'admin' || user.userType === 'super_admin';
    const isSuperAdmin = user.userType === 'super_admin';
    
    console.log('🔐 Permission check:', {
      isAdmin,
      isSuperAdmin,
      userType: user.userType,
      role: user.role
    });

    // 模擬登入驗證邏輯
    if (!user.userType || !user.role || 
        (user.userType !== 'admin' && user.userType !== 'super_admin') || 
        (user.role !== 'admin' && user.role !== 'super_admin')) {
      console.log('❌ Login would fail - insufficient privileges');
      return;
    }

    console.log('✅ Login would succeed - user has admin privileges');

    // 測試密碼驗證（假設密碼是 'password'）
    const testPassword = 'password';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('🔑 Password test:', {
      testPassword,
      isMatch,
      hasPassword: !!user.password
    });

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  testLogin();
}

module.exports = testLogin; 