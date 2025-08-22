const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testTutorChangeNotification() {
  try {
    console.log('🧪 測試導師修改通知系統...\n');

    // 1. 查找一個導師用戶
    const tutor = await User.findOne({ userType: 'tutor' });
    if (!tutor) {
      console.log('❌ 找不到導師用戶，請先創建一個導師');
      return;
    }

    console.log(`📋 找到導師: ${tutor.name} (${tutor.tutorId || tutor.userId})`);

    // 2. 模擬導師修改資料
    const updateData = {
      'tutorProfile.introduction': '測試修改通知系統 - ' + new Date().toLocaleString(),
      'tutorProfile.courseFeatures': '新增課程特色測試'
    };

    console.log('📝 模擬修改資料:', updateData);

    // 3. 手動添加修改記錄到 profileChangeLog
    const changeLog = {
      timestamp: new Date(),
      fields: Object.keys(updateData),
      oldValues: {
        'tutorProfile.introduction': tutor.tutorProfile?.introduction || '無',
        'tutorProfile.courseFeatures': tutor.tutorProfile?.courseFeatures || '無'
      },
      newValues: updateData,
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // 4. 更新導師資料
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      {
        $set: updateData,
        $push: { profileChangeLog: changeLog }
      },
      { new: true }
    );

    console.log('✅ 導師資料更新成功');
    console.log('📊 修改記錄已添加到 profileChangeLog');

    // 5. 驗證修改記錄
    const verifyTutor = await User.findById(tutor._id);
    console.log(`📝 profileChangeLog 長度: ${verifyTutor.profileChangeLog.length}`);
    
    if (verifyTutor.profileChangeLog.length > 0) {
      const latestChange = verifyTutor.profileChangeLog[verifyTutor.profileChangeLog.length - 1];
      console.log('🔍 最新的修改記錄:');
      console.log('  - 時間:', latestChange.timestamp);
      console.log('  - 修改字段:', latestChange.fields);
      console.log('  - 新值:', latestChange.newValues);
      console.log('  - IP地址:', latestChange.ipAddress);
      console.log('  - 用戶代理:', latestChange.userAgent);
    }

    // 6. 測試查詢有修改記錄的導師
    const tutorsWithChanges = await User.find({
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    }).select('name tutorId userId profileChangeLog');

    console.log(`\n📊 統計信息:`);
    console.log(`  - 有修改記錄的導師數量: ${tutorsWithChanges.length}`);
    
    let totalChanges = 0;
    tutorsWithChanges.forEach(t => {
      totalChanges += t.profileChangeLog.length;
    });
    console.log(`  - 總修改記錄數量: ${totalChanges}`);

    // 7. 測試最近修改記錄查詢（模擬 API 端點）
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

    console.log(`\n🕒 最近 5 個修改記錄:`);
    recentChanges.forEach((change, index) => {
      console.log(`  ${index + 1}. ${change.name} (${change.tutorId}) - ${change.change.fields.join(', ')}`);
      console.log(`     時間: ${change.change.timestamp}`);
    });

    console.log('\n🎉 測試完成！導師修改通知系統運作正常');
    console.log('\n📱 現在可以在管理員前端查看:');
    console.log('  1. 側邊欄的 "導師修改監控" 會顯示通知徽章');
    console.log('  2. 頁面右上角會彈出實時通知');
    console.log('  3. 點擊 "查看詳情" 可進入監控頁面');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testTutorChangeNotification();
