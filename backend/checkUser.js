const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB 連接成功');
    
    // 查找所有用戶
    const users = await User.find({}).limit(10);
    console.log('用戶列表:');
    users.forEach((user, i) => {
      console.log(`${i+1}. ${user.name} - userId: ${user.userId} - tutorId: ${user.tutorId}`);
    });
    
    // 查找包含 1001000 的用戶
    const user1001000 = await User.findOne({ userId: '1001000' });
    if (user1001000) {
      console.log('找到 userId=1001000 的用戶:', {
        name: user1001000.name,
        userId: user1001000.userId,
        tutorId: user1001000.tutorId
      });
    } else {
      console.log('未找到 userId=1001000 的用戶');
    }
    
    // 查找包含 TU0104 的用戶
    const userTU0104 = await User.findOne({ tutorId: 'TU0104' });
    if (userTU0104) {
      console.log('找到 tutorId=TU0104 的用戶:', {
        name: userTU0104.name,
        userId: userTU0104.userId,
        tutorId: userTU0104.tutorId
      });
    } else {
      console.log('未找到 tutorId=TU0104 的用戶');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 錯誤:', error);
    process.exit(1);
  }
}

checkUsers();
