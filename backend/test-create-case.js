const mongoose = require('mongoose');
const StudentCase = require('./models/StudentCase');
const TutorCase = require('./models/TutorCase');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCreateCase() {
  try {
    console.log('🧪 測試案例創建功能...\n');

    // 測試創建學生案例
    console.log('📚 測試創建學生案例...');
    const studentCaseData = {
      title: '測試學生案例',
      description: '這是一個測試用的學生案例',
      subject: '數學',
      type: 'student',
      category: 'primary-secondary',
      subCategory: 'primary',
      subjects: ['primary-math'],
      regions: ['all-hong-kong'],
      subRegions: ['hong-kong-island-admiralty'],
      budget: '500',
      mode: '面對面',
      experience: '初學者'
    };

    try {
      // 生成唯一的案例ID
      const timestamp = Date.now();
      const uniqueId = `S${timestamp}`;
      
      const studentCase = new StudentCase({
        id: uniqueId,
        title: studentCaseData.title || '',
        subject: studentCaseData.subject || '',
        subjects: studentCaseData.subjects || [],
        category: studentCaseData.category || '',
        subCategory: studentCaseData.subCategory || '',
        regions: studentCaseData.regions || [],
        subRegions: studentCaseData.subRegions || [],
        budget: studentCaseData.budget || '',
        mode: studentCaseData.mode || '線上',
        modes: studentCaseData.mode ? [studentCaseData.mode] : ['線上'],
        requirement: studentCaseData.description || '',
        status: 'open',
        isApproved: true,
        featured: false,
        isVip: false,
        isTop: false,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedStudentCase = await studentCase.save();
      console.log('✅ 學生案例創建成功:', {
        id: savedStudentCase.id,
        title: savedStudentCase.title,
        status: savedStudentCase.status
      });
    } catch (error) {
      console.error('❌ 學生案例創建失敗:', error.message);
    }

    // 測試創建導師案例
    console.log('\n👨‍🏫 測試創建導師案例...');
    const tutorCaseData = {
      title: '測試導師案例',
      description: '這是一個測試用的導師案例',
      subject: '中文',
      type: 'tutor',
      category: 'primary-secondary',
      subCategory: 'primary',
      subjects: ['primary-chinese'],
      regions: ['all-hong-kong'],
      subRegions: ['kowloon-to-kwa-wan'],
      budget: '600',
      mode: '線上',
      experience: '3-5年教學經驗' // 使用正確的枚舉值
    };

    try {
      // 生成唯一的案例ID
      const timestamp = Date.now();
      const uniqueId = `T${timestamp}`;
      
      const tutorCase = new TutorCase({
        id: uniqueId, // TutorCase 模型需要這個字段
        title: tutorCaseData.title || '未命名案例',
        description: tutorCaseData.description || '無描述',
        subject: tutorCaseData.subject || '未指定科目',
        subjects: tutorCaseData.subjects || ['未指定'],
        category: tutorCaseData.category || '未指定分類',
        subCategory: tutorCaseData.subCategory || '',
        regions: tutorCaseData.regions || [],
        subRegions: tutorCaseData.subRegions || [],
        mode: tutorCaseData.mode || '面對面',
        modes: tutorCaseData.mode ? [tutorCaseData.mode] : ['面對面'],
        experience: tutorCaseData.experience || '無教學經驗要求',
        status: 'open',
        isApproved: false,
        featured: false,
        student: '507f1f77bcf86cd799439011', // 提供一個有效的ObjectId格式
        lessonDetails: {
          duration: 60,
          pricePerLesson: parseInt(tutorCaseData.budget) || 0,
          lessonsPerWeek: 1
        }
      });

      const savedTutorCase = await tutorCase.save();
      console.log('✅ 導師案例創建成功:', {
        id: savedTutorCase.id,
        title: savedTutorCase.title,
        status: savedTutorCase.status
      });
    } catch (error) {
      console.error('❌ 導師案例創建失敗:', error.message);
    }

    // 驗證數據庫中的案例
    console.log('\n📊 驗證數據庫中的案例...');
    
    const studentCases = await StudentCase.find().limit(5);
    console.log(`📚 學生案例數量: ${studentCases.length}`);
    studentCases.forEach((case_, index) => {
      console.log(`  ${index + 1}. ${case_.title} (${case_.id}) - ${case_.status}`);
    });

    const tutorCases = await TutorCase.find().limit(5);
    console.log(`👨‍🏫 導師案例數量: ${tutorCases.length}`);
    tutorCases.forEach((case_, index) => {
      console.log(`  ${index + 1}. ${case_.title} (${case_._id}) - ${case_.status}`);
    });

    console.log('\n🎉 案例創建測試完成！');
    console.log('\n📱 現在可以在管理員後台測試:');
    console.log('  1. 嘗試創建學生案例');
    console.log('  2. 嘗試創建導師案例');
    console.log('  3. 檢查是否還有 Internal Server Error');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testCreateCase();
