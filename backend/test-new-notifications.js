const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testNewNotifications() {
  try {
    console.log('🧪 創建新的導師修改記錄來測試通知系統...\n');

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

    // 創建多個新的測試修改記錄
    const newChangeLogs = [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分鐘前
        fields: [
          'tutorProfile.introduction',
          'tutorProfile.courseFeatures',
          'tutorProfile.subjects'
        ],
        oldValues: {
          'tutorProfile.introduction': '舊的自我介紹',
          'tutorProfile.courseFeatures': '舊的課程特色',
          'tutorProfile.subjects': ['舊科目']
        },
        newValues: {
          'tutorProfile.introduction': `新通知測試1 - ${new Date().toLocaleString('zh-TW')}`,
          'tutorProfile.courseFeatures': '新增通知測試功能1',
          'tutorProfile.subjects': ['數學', '中文', '英文', '通知測試1']
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - New Notification Test 1'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3分鐘前
        fields: [
          'tutorProfile.teachingAreas',
          'tutorProfile.sessionRate'
        ],
        oldValues: {
          'tutorProfile.teachingAreas': ['舊地區'],
          'tutorProfile.sessionRate': '舊價格'
        },
        newValues: {
          'tutorProfile.teachingAreas': ['香港島', '九龍', '新界'],
          'tutorProfile.sessionRate': '新價格 - $500/小時'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - New Notification Test 2'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1分鐘前
        fields: [
          'tutorProfile.educationLevel',
          'tutorProfile.teachingExperienceYears'
        ],
        oldValues: {
          'tutorProfile.educationLevel': '舊學歷',
          'tutorProfile.teachingExperienceYears': '舊經驗'
        },
        newValues: {
          'tutorProfile.educationLevel': '碩士學位',
          'tutorProfile.teachingExperienceYears': '5-10年教學經驗'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - New Notification Test 3'
      }
    ];

    // 添加新的修改記錄
    if (!testTutor.profileChangeLog) {
      testTutor.profileChangeLog = [];
    }
    
    // 將新記錄添加到開頭
    newChangeLogs.forEach(log => {
      testTutor.profileChangeLog.unshift(log);
    });
    
    // 保存更新
    await testTutor.save();
    
    console.log('✅ 已添加 3 條新的測試修改記錄');
    newChangeLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. 時間: ${log.timestamp.toLocaleString('zh-TW')}`);
      console.log(`     字段: ${log.fields.join(', ')}`);
      console.log(`     唯一ID: ${testTutor.tutorId}_${log.timestamp.toISOString()}`);
    });

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
        $limit: 10
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
      console.log('\n🎯 最新的5條修改記錄:');
      recentChanges.slice(0, 5).forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.name} (${change.tutorId})`);
        console.log(`     時間: ${change.change.timestamp}`);
        console.log(`     字段: ${change.change.fields.join(', ')}`);
        console.log(`     唯一ID: ${change.tutorId}_${change.change.timestamp}`);
        console.log('');
      });
    }

    console.log('💡 測試說明:');
    console.log('1. 現在請刷新管理員前端頁面');
    console.log('2. 應該會看到新的通知彈出（顯示3條新記錄）');
    console.log('3. 點擊"標記為已讀"按鈕');
    console.log('4. 通知應該會消失');
    console.log('5. 如果沒有通知彈出，點擊右上角的"重置通知狀態"按鈕');

    console.log('\n🎉 新通知測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testNewNotifications();
