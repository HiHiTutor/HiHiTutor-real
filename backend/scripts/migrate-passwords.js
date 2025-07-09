const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 連接到 MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 用戶模型
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  userType: String,
  phone: String,
  role: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

// 遷移密碼
const migratePasswords = async () => {
  try {
    console.log('🔍 查找所有用戶...');
    const users = await User.find({});
    console.log(`📊 找到 ${users.length} 個用戶`);

    for (const user of users) {
      // 檢查密碼是否已經是 bcrypt 格式（bcrypt hash 通常以 $2a$, $2b$, $2x$, $2y$ 開頭）
      if (user.password && !user.password.startsWith('$2')) {
        console.log(`🔐 加密用戶 ${user.email} 的密碼...`);
        
        // 加密密碼
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // 更新用戶密碼
        await User.findByIdAndUpdate(user._id, { 
          password: hashedPassword,
          updatedAt: new Date()
        });
        
        console.log(`✅ 用戶 ${user.email} 密碼已加密`);
      } else {
        console.log(`⏭️ 用戶 ${user.email} 密碼已經是加密格式，跳過`);
      }
    }

    console.log('🎉 密碼遷移完成！');
  } catch (error) {
    console.error('❌ 密碼遷移失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB 連接已關閉');
  }
};

// 執行遷移
const run = async () => {
  await connectDB();
  await migratePasswords();
};

run(); 