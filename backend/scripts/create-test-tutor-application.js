const mongoose = require('mongoose');
const TutorApplication = require('../models/TutorApplication');

// 連接資料庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ 資料庫連接成功');
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error);
    process.exit(1);
  }
};

// 創建測試導師申請資料
const createTestTutorApplication = async () => {
  try {
    await connectDB();
    
    // 創建一個包含 regions 資料的測試申請
    const testApplication = new TutorApplication({
      id: `TA_${Date.now()}`,
      userId: `user_${Date.now()}`,
      userNumber: `U${Date.now()}`,
      name: '測試導師',
      email: `test_${Date.now()}@example.com`,
      phone: '91234567',
      gender: 'male',
      birthDate: '1990-01-01',
      education: '大學畢業',
      experience: 3,
      courseFeatures: '專注於數學和物理教學',
      subjects: ['secondary-math', 'secondary-physics'],
      regions: ['hong-kong-island', 'kowloon', 'new-territories'], // 包含地區資料
      teachingMode: ['in-person', 'online'],
      hourlyRate: '300',
      documents: ['test-document.pdf'],
      status: 'pending'
    });

    await testApplication.save();
    console.log('✅ 測試導師申請已創建:', testApplication);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 創建測試申請失敗:', error);
    process.exit(1);
  }
};

createTestTutorApplication();
