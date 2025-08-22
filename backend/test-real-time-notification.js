const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRealTimeNotification() {
  try {
    console.log('🧪 測試實時通知系統...\n');

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

    // 模擬導師修改資料
    const newChangeLog = {
      timestamp: new Date(),
      fields: [
        'tutorProfile.introduction',
        'tutorProfile.courseFeatures',
        'tutorProfile.subjects'
      ],
      oldValues: {
        'tutorProfile.introduction': testTutor.tutorProfile?.introduction || '舊的自我介紹',
        'tutorProfile.courseFeatures': testTutor.tutorProfile?.courseFeatures || '舊的課程特色',
        'tutorProfile.subjects': testTutor.tutorProfile?.subjects || ['舊科目']
      },
      newValues: {
        'tutorProfile.introduction': `實時通知測試 - ${new Date().toLocaleString('zh-TW')}`,
        'tutorProfile.courseFeatures': '新增實時通知測試功能',
        'tutorProfile.subjects': ['數學', '中文', '英文', '實時通知測試']
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Real-time Notification Test'
    };

    // 添加新的修改記錄
    if (!testTutor.profileChangeLog) {
      testTutor.profileChangeLog = [];
    }
    
    testTutor.profileChangeLog.unshift(newChangeLog);
    
    // 保存更新
    await testTutor.save();
    
    console.log('✅ 已添加新的修改記錄');
    console.log(`📝 修改字段: ${newChangeLog.fields.join(', ')}`);
    console.log(`🕐 修改時間: ${newChangeLog.timestamp.toLocaleString('zh-TW')}`);
    console.log(`🌐 IP地址: ${newChangeLog.ipAddress}`);
    
    // 測試 recent-changes API 是否能獲取到新記錄
    console.log('\n🔍 測試 recent-changes API...');
    
    const recentChanges = await User.aggregate([
      {
        $match: {
          userType: { $in: ['tutor', 'organization'] },
          profileChangeLog: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$profileChangeLog'
      },
      {
        $sort: { 'profileChangeLog.timestamp': -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          tutorId: { $ifNull: ['$tutorId', '$userId', { $concat: ['unknown_', { $toString: '$_id' }] }] },
          name: { $ifNull: ['$name', '未知姓名'] },
          email: { $ifNull: ['$email', '未知郵箱'] },
          change: {
            timestamp: '$profileChangeLog.timestamp',
            fields: { $ifNull: ['$profileChangeLog.fields', []] },
            newValues: { $ifNull: ['$profileChangeLog.newValues', {}] },
            oldValues: { $ifNull: ['$profileChangeLog.oldValues', {}] },
            ipAddress: '$profileChangeLog.ipAddress',
            userAgent: '$profileChangeLog.userAgent'
          }
        }
      }
    ]);

    console.log(`📊 recent-changes API 返回 ${recentChanges.length} 條記錄`);
    
    if (recentChanges.length > 0) {
      const latestChange = recentChanges[0];
      console.log(`🎯 最新修改記錄:`);
      console.log(`  - 導師: ${latestChange.name} (${latestChange.tutorId})`);
      console.log(`  - 時間: ${latestChange.change.timestamp}`);
      console.log(`  - 字段: ${latestChange.change.fields.join(', ')}`);
    }

    console.log('\n🎉 實時通知測試完成！');
    console.log('💡 現在請刷新管理員前端頁面，應該會看到紅色通知彈出！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testRealTimeNotification();
