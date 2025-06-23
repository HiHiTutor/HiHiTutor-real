const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugTutorProfile() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');

    // 檢查 userId 為 1000002 的用戶
    const user = await User.findOne({ userId: '1000002' });
    
    if (!user) {
      console.log('❌ 找不到 userId 為 1000002 的用戶');
      return;
    }

    console.log('👤 用戶資料:');
    console.log(`   _id: ${user._id}`);
    console.log(`   userId: ${user.userId}`);
    console.log(`   name: ${user.name}`);
    console.log(`   email: ${user.email}`);
    console.log(`   userType: ${user.userType}`);
    console.log(`   role: ${user.role}`);

    // 生成新的 JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        userType: user.userType
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('\n🎟️ 新生成的 JWT token:');
    console.log(token);

    // 解碼 token 檢查內容
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('\n🔍 JWT token 解碼內容:');
    console.log(JSON.stringify(decoded, null, 2));

    // 模擬 getTutorProfile 的邏輯
    console.log('\n🔍 模擬 getTutorProfile 邏輯:');
    const tokenUserId = decoded.userId;
    console.log(`   tokenUserId: ${tokenUserId}`);
    
    const foundUser = await User.findOne({ userId: tokenUserId }).select('-password');
    console.log(`   查找結果: ${foundUser ? '找到' : '找不到'}`);
    
    if (foundUser) {
      console.log(`   用戶類型: ${foundUser.userType}`);
      console.log(`   是否為導師: ${foundUser.userType === 'tutor' ? '是' : '否'}`);
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  debugTutorProfile();
}

module.exports = { debugTutorProfile }; 