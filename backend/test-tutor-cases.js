require('dotenv').config();
const mongoose = require('mongoose');
const TutorCase = require('./models/TutorCase');

async function testTutorCases() {
  try {
    console.log('🔍 開始測試 TutorCase 數據...');
    
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');
    
    // 檢查總數
    const totalCount = await TutorCase.countDocuments();
    console.log('📊 TutorCase 總數:', totalCount);
    
    // 檢查已審批的案例
    const approvedCount = await TutorCase.countDocuments({ isApproved: true });
    console.log('📊 已審批案例數:', approvedCount);
    
    // 獲取所有案例
    const allCases = await TutorCase.find().limit(5);
    console.log('📋 前5個案例:');
    allCases.forEach((caseItem, index) => {
      console.log(`  ${index + 1}. ID: ${caseItem.id}, 標題: ${caseItem.title}, 審批: ${caseItem.isApproved}`);
    });
    
    // 測試 API 查詢
    const apiQuery = { isApproved: true };
    const apiCases = await TutorCase.find(apiQuery).limit(3);
    console.log('🔍 API 查詢結果 (isApproved: true):', apiCases.length);
    
    if (apiCases.length === 0) {
      console.log('⚠️ 沒有找到已審批的案例，創建測試數據...');
      
      // 創建測試數據
      const testCase = new TutorCase({
        id: 'test-case-001',
        title: '測試導師個案',
        description: '這是一個測試導師個案',
        subject: '數學',
        subjects: ['數學'],
        category: '中小學教育',
        subCategory: '中學教育',
        regions: ['kowloon'],
        mode: '面授',
        modes: ['面授'],
        lessonDetails: {
          duration: 60,
          pricePerLesson: 300,
          lessonsPerWeek: 2
        },
        experience: '3-5年教學經驗',
        isApproved: true,
        featured: true
      });
      
      await testCase.save();
      console.log('✅ 已創建測試案例');
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開數據庫連接');
  }
}

testTutorCases(); 