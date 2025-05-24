require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const usersPath = path.join(__dirname, '../data/users.json');

async function migrateUsers() {
  try {
    // 連接 MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 讀取 JSON 文件
    const data = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(data);
    console.log(`📦 Found ${users.length} users in JSON file`);

    // 清空現有用戶
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // 轉換用戶資料格式
    const formattedUsers = users.map(user => ({
      ...user,
      _id: user.id, // 使用現有的 id 作為 MongoDB 的 _id
      createdAt: new Date(user.createdAt),
      updatedAt: new Date()
    }));

    // 批量插入用戶
    await User.insertMany(formattedUsers);
    console.log('✅ Successfully migrated users to MongoDB');

    // 驗證遷移結果
    const count = await User.countDocuments();
    console.log(`📊 Total users in MongoDB: ${count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

migrateUsers(); 