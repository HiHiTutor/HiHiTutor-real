const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 測試密碼
    const testPassword = '88888888';
    
    // 查找用戶
    const user = await User.findOne({ phone: '90767559' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('🔍 User found:', {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      status: user.status,
      passwordLength: user.password.length
    });

    // 測試密碼比對
    console.log('🔑 Testing password comparison...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('✅ Password match:', isMatch);

    // 測試重新加密
    console.log('🔐 Testing re-encryption...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('✅ New hash length:', newHash.length);
    console.log('✅ Hash comparison:', newHash === user.password);

    // 測試 User model 的 comparePassword 方法
    console.log('🔑 Testing User model comparePassword method...');
    const modelMatch = await user.comparePassword(testPassword);
    console.log('✅ Model password match:', modelMatch);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

testPassword(); 