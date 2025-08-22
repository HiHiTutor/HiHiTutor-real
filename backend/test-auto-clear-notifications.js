const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAutoClearNotifications() {
  try {
    console.log('🧪 測試自動清除通知邏輯...\n');

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
        'tutorProfile.courseFeatures',
        'tutorProfile.subjects',
        'tutorProfile.teachingAreas'
      ],
      oldValues: {
        'tutorProfile.introduction': '舊的自我介紹',
        'tutorProfile.courseFeatures': '舊的課程特色',
        'tutorProfile.subjects': ['舊科目'],
        'tutorProfile.teachingAreas': ['舊地區']
      },
      newValues: {
        'tutorProfile.introduction': `自動清除測試 - ${new Date().toLocaleString('zh-TW')}`,
        'tutorProfile.courseFeatures': '測試自動清除通知功能',
        'tutorProfile.subjects': ['數學', '中文', '英文', '自動清除測試'],
        'tutorProfile.teachingAreas': ['香港島', '九龍', '新界', '自動清除測試']
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Auto Clear Test'
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

    // 測試 recent-changes API
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
      console.log('\n🎯 最新的修改記錄:');
      recentChanges.slice(0, 3).forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.name} (${change.tutorId})`);
        console.log(`     時間: ${change.change.timestamp}`);
        console.log(`     字段: ${change.change.fields.join(', ')}`);
        console.log('');
      });
    }

    console.log('💡 測試說明:');
    console.log('1. 現在請刷新管理員前端頁面');
    console.log('2. 應該會看到新的通知彈出（顯示新的修改記錄）');
    console.log('3. 點擊"查看詳情"按鈕，會跳轉到導師修改監控頁面');
    console.log('4. 進入導師修改監控頁面後，通知應該會自動消失');
    console.log('5. 左側導航欄的紅色徽章數字也應該會消失');

    console.log('\n🎉 自動清除通知測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testAutoClearNotifications();
