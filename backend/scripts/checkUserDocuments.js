const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// 連接資料庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');

async function checkUserDocuments() {
  try {
    console.log('🔍 檢查用戶文件資料...');
    
    // 查找特定用戶
    const users = await User.find({
      $or: [
        { userId: '1000006' },
        { name: '才高八斗劉阿斗' }
      ]
    });

    console.log(`📊 找到 ${users.length} 個用戶`);

    for (const user of users) {
      console.log(`\n👤 用戶資料:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   userId: ${user.userId}`);
      console.log(`   name: ${user.name}`);
      console.log(`   email: ${user.email}`);
      
      console.log(`\n📁 文件資料:`);
      console.log(`   documents:`, JSON.stringify(user.documents, null, 2));
      
      if (user.documents) {
        console.log(`   avatar: ${user.documents.avatar || '無'}`);
        console.log(`   idCard: ${user.documents.idCard || '無'}`);
        console.log(`   educationCertificates: ${user.documents.educationCertificates ? user.documents.educationCertificates.length : 0} 個`);
        console.log(`   otherFiles: ${user.documents.otherFiles ? user.documents.otherFiles.length : 0} 個`);
      } else {
        console.log(`   documents 字段不存在`);
      }
    }
    
  } catch (error) {
    console.error('❌ 腳本執行失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
  }
}

// 執行腳本
checkUserDocuments(); 