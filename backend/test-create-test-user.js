const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    console.log('🧪 創建測試導師用戶...\n');

    // 檢查是否已存在測試用戶
    const existingUser = await User.findOne({ email: 'testtutor@example.com' });
    if (existingUser) {
      console.log('📋 測試用戶已存在:', existingUser.name);
      return existingUser;
    }

    // 創建測試導師用戶
    const testUser = new User({
      userId: '1001001',
      tutorId: 'TU0105',
      name: '測試導師',
      email: 'testtutor@example.com',
      phone: '12345678',
      password: 'testpassword123', // 添加必需的密碼字段
      userType: 'tutor',
      role: 'user',
      avatar: '/avatars/default.png',
      isActive: true,
      status: 'active',
      rating: 0,
      isTop: false,
      isVip: false,
      totalReviews: 0,
      profileStatus: 'approved',
      remarks: '測試用戶',
      tutorProfile: {
        subjects: ['primary-math', 'primary-chinese'],
        sessionRate: 500,
        teachingMode: 'in-person',
        teachingSubModes: ['one-on-one'],
        region: 'all-hong-kong',
        subRegions: ['hong-kong-island-admiralty'],
        category: 'primary-secondary',
        subCategory: 'primary',
        displayPublic: true,
        teachingExperienceYears: 2,
        examResults: [],
        teachingAreas: [],
        availableTime: [],
        teachingMethods: [],
        classType: [],
        qualifications: [],
        publicCertificates: [],
        documents: [],
        applicationStatus: 'notApplied',
        gender: 'male',
        introduction: '我是一個測試導師',
        courseFeatures: '專注於小學數學和中文教學'
      },
      profileChangeLog: []
    });

    const savedUser = await testUser.save();
    console.log('✅ 測試導師用戶創建成功');
    console.log(`📋 用戶ID: ${savedUser._id}`);
    console.log(`📋 姓名: ${savedUser.name}`);
    console.log(`📋 導師ID: ${savedUser.tutorId}`);

    return savedUser;

  } catch (error) {
    console.error('❌ 創建測試用戶失敗:', error);
    return null;
  }
}

async function createTutorChange() {
  try {
    console.log('\n🧪 創建導師修改記錄...\n');

    // 創建或獲取測試用戶
    const tutor = await createTestUser();
    if (!tutor) {
      console.log('❌ 無法創建或獲取測試用戶');
      return;
    }

    // 創建一個新的修改記錄
    const changeLog = {
      timestamp: new Date(),
      fields: ['tutorProfile.introduction', 'tutorProfile.courseFeatures'],
      oldValues: {
        'tutorProfile.introduction': '我是一個測試導師',
        'tutorProfile.courseFeatures': '專注於小學數學和中文教學'
      },
      newValues: {
        'tutorProfile.introduction': '測試修改通知系統 - ' + new Date().toLocaleString(),
        'tutorProfile.courseFeatures': '新增課程特色測試 - 專注於小學數學和中文教學'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // 更新導師資料，添加修改記錄
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      {
        $push: { profileChangeLog: changeLog }
      },
      { new: true }
    );

    console.log('✅ 導師修改記錄已創建');
    console.log(`📝 profileChangeLog 長度: ${updatedTutor.profileChangeLog.length}`);

    // 驗證修改記錄
    const latestChange = updatedTutor.profileChangeLog[updatedTutor.profileChangeLog.length - 1];
    console.log('🔍 最新的修改記錄:');
    console.log('  - 時間:', latestChange.timestamp);
    console.log('  - 修改字段:', latestChange.fields);
    console.log('  - 新值:', latestChange.newValues);
    console.log('  - IP地址:', latestChange.ipAddress);
    console.log('  - 用戶代理:', latestChange.userAgent);

    console.log('\n🎉 測試數據創建完成！');
    console.log('\n📱 現在可以在管理員前端測試:');
    console.log('  1. 檢查側邊欄 "導師修改監控" 是否顯示通知徽章');
    console.log('  2. 檢查頁面右上角是否彈出通知');
    console.log('  3. 訪問 /notification-test 頁面測試 API');

  } catch (error) {
    console.error('❌ 創建測試數據失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
createTutorChange();
