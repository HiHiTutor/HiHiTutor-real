const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找用戶
    const user = await User.findOne({ phone: '90767559' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('🔍 Current user:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      passwordLength: user.password.length
    });

    // 原始密碼
    const originalPassword = '88888888';
    
    // 重新加密密碼（只加密一次）
    console.log('🔐 Re-encrypting password...');
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(originalPassword, salt);
    
    console.log('📊 Password comparison:');
    console.log('- Original password:', originalPassword);
    console.log('- Old hash length:', user.password.length);
    console.log('- New hash length:', newHashedPassword.length);
    console.log('- Hashes are different:', user.password !== newHashedPassword);

    // 更新用戶密碼
    user.password = newHashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully');

    // 驗證新密碼
    console.log('🔑 Testing new password...');
    const isMatch = await bcrypt.compare(originalPassword, user.password);
    console.log('✅ Password verification:', isMatch);

    // 再次查詢確認更新
    const updatedUser = await User.findOne({ phone: '90767559' });
    console.log('🔍 Updated user password length:', updatedUser.password.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixUserPassword(); 