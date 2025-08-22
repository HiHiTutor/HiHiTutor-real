const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTutorChange() {
  try {
    console.log('🧪 創建導師修改記錄用於測試...\n');

    // 1. 查找一個導師用戶
    const tutor = await User.findOne({ userType: 'tutor' });
    if (!tutor) {
      console.log('❌ 找不到導師用戶，請先創建一個導師');
      return;
    }

    console.log(`📋 找到導師: ${tutor.name} (${tutor.tutorId || tutor.userId})`);

    // 2. 創建一個新的修改記錄
    const changeLog = {
      timestamp: new Date(),
      fields: ['tutorProfile.introduction', 'tutorProfile.courseFeatures'],
      oldValues: {
        'tutorProfile.introduction': '舊的自我介紹',
        'tutorProfile.courseFeatures': '舊的課程特色'
      },
      newValues: {
        'tutorProfile.introduction': '測試修改通知系統 - ' + new Date().toLocaleString(),
        'tutorProfile.courseFeatures': '新增課程特色測試'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // 3. 更新導師資料，添加修改記錄
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      {
        $push: { profileChangeLog: changeLog }
      },
      { new: true }
    );

    console.log('✅ 導師修改記錄已創建');
    console.log(`📝 profileChangeLog 長度: ${updatedTutor.profileChangeLog.length}`);

    // 4. 驗證修改記錄
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
