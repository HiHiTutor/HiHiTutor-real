const mongoose = require('mongoose');
const TutorCase = require('../models/TutorCase');

async function updateApprovalStatus() {
  try {
    // 連接到 MongoDB
    await mongoose.connect('mongodb://localhost:27017/HiHiTutorReally');
    console.log('✅ Connected to MongoDB');

    // 更新所有案例的審批狀態
    const result = await TutorCase.updateMany(
      {}, // 匹配所有文檔
      { $set: { isApproved: true } } // 將 isApproved 設為 true
    );

    console.log('📊 Update result:', result);
    console.log('✅ Successfully updated all cases to approved status');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // 關閉數據庫連接
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// 執行更新
updateApprovalStatus(); 