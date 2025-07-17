const mongoose = require('mongoose');
const User = require('../models/User');

async function searchUser() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 搜索包含 60761408 的用戶
    console.log('🔍 Searching for users containing "60761408"...');
    
    const users = await User.find({
      $or: [
        { phone: { $regex: '60761408', $options: 'i' } },
        { userId: { $regex: '60761408', $options: 'i' } },
        { email: { $regex: '60761408', $options: 'i' } },
        { name: { $regex: '60761408', $options: 'i' } }
      ]
    }).select('name email phone userId userType role status createdAt');

    if (users.length === 0) {
      console.log('❌ No users found containing "60761408"');
      
      // 顯示所有用戶的基本信息
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('name email phone userId userType role status createdAt').limit(20);
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.phone} - ${user.userId} - ${user.userType}/${user.role}`);
      });
      
      if (allUsers.length >= 20) {
        console.log(`... and ${await User.countDocuments()} - 20 more users`);
      }
    } else {
      console.log(`✅ Found ${users.length} user(s) containing "60761408":`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.phone} - ${user.userId} - ${user.userType}/${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error searching users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  searchUser();
}

module.exports = searchUser; 