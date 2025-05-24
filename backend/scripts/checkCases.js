const mongoose = require('mongoose');
const TutorCase = require('../models/TutorCase');

async function checkCases() {
  try {
    // 連接到 MongoDB
    await mongoose.connect('mongodb://localhost:27017/HiHiTutorReally');
    console.log('✅ Connected to MongoDB');

    // 獲取所有案例
    const cases = await TutorCase.find({});
    console.log('📊 Total cases:', cases.length);
    console.log('📋 Cases:', JSON.stringify(cases, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // 關閉數據庫連接
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// 執行檢查
checkCases(); 