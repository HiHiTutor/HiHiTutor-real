const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testUserLogin() {
  try {
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    const identifier = '91111031';
    const password = '88888888';

    console.log('🔍 測試登入:', { identifier, password });

    // 檢查是否為 email 或電話
    const isEmail = identifier.includes('@');
    const isPhone = /^[5689]\d{7}$/.test(identifier);

    console.log('📱 格式檢查:', { isEmail, isPhone, identifier });

    if (!isEmail && !isPhone) {
      console.log('❌ 無效的帳號格式');
      return;
    }

    // 查找用戶
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    console.log('🔍 用戶查找結果:', {
      found: !!user,
      userId: user?._id,
      userPhone: user?.phone,
      userEmail: user?.email,
      userName: user?.name,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length
    });

    if (!user) {
      console.log('❌ 找不到用戶');
      return;
    }

    // 測試密碼比對
    console.log('🔑 測試密碼比對...');
    const match = await bcrypt.compare(password, user.password);
    console.log('🔑 密碼比對結果:', match);

    if (!match) {
      console.log('❌ 密碼不匹配');
      
      // 診斷密碼問題
      const testHash = await bcrypt.hash(password, 10);
      console.log('🔍 密碼診斷:', {
        providedPassword: password,
        testHash: testHash.substring(0, 20) + '...',
        storedHash: user.password.substring(0, 20) + '...',
        doHashesMatch: testHash === user.password
      });
    } else {
      console.log('✅ 密碼匹配成功');
    }

    // 列出所有用戶
    console.log('\n📋 所有用戶列表:');
    const allUsers = await User.find({}, 'phone email name userType');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.phone} | ${u.email} | ${u.name} | ${u.userType}`);
    });

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testUserLogin(); 