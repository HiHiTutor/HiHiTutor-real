const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找用戶
    const user = await User.findOne({ phone: '90767559' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('🔍 Current user status:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      status: user.status
    });

    // 更新為 admin
    user.userType = 'admin';
    user.role = 'admin';
    user.status = 'active';
    
    await user.save();
    
    console.log('✅ User updated to admin:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      status: user.status
    });

    // 驗證更新
    const updatedUser = await User.findOne({ phone: '90767559' });
    console.log('🔍 Verification - Updated user:', {
      name: updatedUser.name,
      userType: updatedUser.userType,
      role: updatedUser.role,
      status: updatedUser.status
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

makeAdmin(); 