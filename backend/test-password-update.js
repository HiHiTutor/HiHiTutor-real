const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testPasswordUpdate() {
  try {
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    const phone = '91111031';
    const oldPassword = '88888888';
    const newPassword = '12345678';

    console.log('🔍 測試密碼更新:', { phone, oldPassword, newPassword });

    // 查找用戶
    const user = await User.findOne({ phone });
    console.log('🔍 用戶查找結果:', {
      found: !!user,
      userId: user?._id,
      userName: user?.name,
      hasPassword: !!user?.password
    });

    if (!user) {
      console.log('❌ 找不到用戶');
      return;
    }

    // 測試舊密碼
    console.log('🔑 測試舊密碼...');
    const oldMatch = await bcrypt.compare(oldPassword, user.password);
    console.log('🔑 舊密碼比對結果:', oldMatch);

    // 模擬密碼更新
    console.log('🔄 模擬密碼更新...');
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密碼
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { password: hashedNewPassword } },
      { new: true }
    );

    console.log('✅ 密碼更新成功');

    // 測試新密碼
    console.log('🔑 測試新密碼...');
    const newMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('🔑 新密碼比對結果:', newMatch);

    // 測試舊密碼（應該失敗）
    console.log('🔑 測試舊密碼（應該失敗）...');
    const oldMatchAfterUpdate = await bcrypt.compare(oldPassword, updatedUser.password);
    console.log('🔑 舊密碼比對結果（更新後）:', oldMatchAfterUpdate);

    console.log('✅ 密碼更新測試完成');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testPasswordUpdate(); 