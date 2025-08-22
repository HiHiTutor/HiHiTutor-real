const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testNotificationAPI() {
  try {
    console.log('🧪 測試通知 API 端點...\n');

    // 1. 檢查是否有導師用戶
    const tutors = await User.find({ userType: 'tutor' }).limit(5);
    console.log(`📋 找到 ${tutors.length} 個導師用戶`);

    if (tutors.length === 0) {
      console.log('❌ 沒有找到導師用戶，無法測試');
      return;
    }

    // 2. 檢查 profileChangeLog 字段
    const tutorsWithChanges = await User.find({
      userType: 'tutor',
      profileChangeLog: { $exists: true, $ne: [] }
    });

    console.log(`📝 有修改記錄的導師數量: ${tutorsWithChanges.length}`);

    // 3. 如果沒有修改記錄，創建一些測試數據
    if (tutorsWithChanges.length === 0) {
      console.log('🔄 創建測試修改記錄...');
      
      const testTutor = tutors[0];
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
        userAgent: 'Test Script'
      };

      await User.findByIdAndUpdate(testTutor._id, {
        $push: { profileChangeLog: changeLog }
      });

      console.log('✅ 測試修改記錄已創建');
    }

    // 4. 測試查詢邏輯（模擬 API 端點）
    console.log('\n🔍 測試查詢邏輯...');

    // 測試 recent-changes 端點邏輯
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
          tutorId: { $ifNull: ['$tutorId', '$userId'] },
          name: 1,
          email: 1,
          change: '$profileChangeLog'
        }
      }
    ]);

    console.log(`🕒 最近 5 個修改記錄: ${recentChanges.length}`);
    recentChanges.forEach((change, index) => {
      console.log(`  ${index + 1}. ${change.name} (${change.tutorId})`);
      console.log(`     修改字段: ${change.change.fields.join(', ')}`);
      console.log(`     時間: ${change.change.timestamp}`);
    });

    // 測試 tutor-changes 端點邏輯
    const allChanges = await User.find({
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    }).select('name email tutorId userId profileChangeLog createdAt');

    console.log(`\n📊 所有有修改記錄的導師: ${allChanges.length}`);
    
    let totalChanges = 0;
    allChanges.forEach(tutor => {
      totalChanges += tutor.profileChangeLog.length;
      console.log(`  - ${tutor.name} (${tutor.tutorId || tutor.userId}): ${tutor.profileChangeLog.length} 個修改`);
    });

    console.log(`\n📈 總修改記錄數量: ${totalChanges}`);

    // 5. 測試時間過濾邏輯
    console.log('\n⏰ 測試時間過濾邏輯...');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let recentChangesCount = 0;
    allChanges.forEach(tutor => {
      tutor.profileChangeLog.forEach(change => {
        if (new Date(change.timestamp) > oneDayAgo) {
          recentChangesCount++;
        }
      });
    });

    console.log(`最近24小時內的修改記錄: ${recentChangesCount}`);

    console.log('\n🎉 API 測試完成！');
    console.log('\n📱 現在可以在管理員前端測試:');
    console.log('  1. 檢查瀏覽器控制台是否有錯誤');
    console.log('  2. 檢查網絡請求是否成功');
    console.log('  3. 檢查通知組件是否正確渲染');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testNotificationAPI();
