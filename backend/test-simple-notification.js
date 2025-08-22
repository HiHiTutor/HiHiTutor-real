const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testSimpleNotification() {
  try {
    console.log('🧪 創建簡單的通知測試...\n');

    // 查找測試導師
    const testTutor = await User.findOne({
      email: 'testtutor@example.com',
      userType: 'tutor'
    });

    if (!testTutor) {
      console.log('❌ 找不到測試導師，請先運行 test-create-test-user.js');
      return;
    }

    console.log(`✅ 找到測試導師: ${testTutor.name} (${testTutor.tutorId})`);

    // 創建一個新的測試修改記錄（當前時間）
    const newChangeLog = {
      timestamp: new Date(),
      fields: [
        'tutorProfile.introduction',
        'tutorProfile.courseFeatures'
      ],
      oldValues: {
        'tutorProfile.introduction': '舊的自我介紹',
        'tutorProfile.courseFeatures': '舊的課程特色'
      },
      newValues: {
        'tutorProfile.introduction': `簡單通知測試 - ${new Date().toLocaleString('zh-TW')}`,
        'tutorProfile.courseFeatures': '測試通知消失功能'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Simple Notification Test'
    };

    // 添加新的修改記錄
    if (!testTutor.profileChangeLog) {
      testTutor.profileChangeLog = [];
    }
    
    // 將新記錄添加到開頭
    testTutor.profileChangeLog.unshift(newChangeLog);
    
    // 保存更新
    await testTutor.save();
    
    console.log('✅ 已添加新的測試修改記錄');
    console.log(`📝 修改字段: ${newChangeLog.fields.join(', ')}`);
    console.log(`🕐 修改時間: ${newChangeLog.timestamp.toLocaleString('zh-TW')}`);

    console.log('\n💡 測試步驟:');
    console.log('1. 刷新管理員前端頁面');
    console.log('2. 應該會看到新的通知彈出');
    console.log('3. 點擊"查看詳情"按鈕');
    console.log('4. 進入導師修改監控頁面後，通知應該會自動消失');
    console.log('5. 如果通知沒有消失，請檢查控制台日誌');

    console.log('\n🎉 簡單通知測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testSimpleNotification();
