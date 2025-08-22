const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRecentChangesAPI() {
  try {
    console.log('🧪 測試修復後的 recent-changes API...\n');

    // 模擬API的聚合查詢邏輯
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

    console.log(`📊 找到 ${recentChanges.length} 條記錄\n`);

    // 過濾掉無效的記錄
    const validChanges = recentChanges.filter(change => 
      change.change && 
      change.change.timestamp && 
      Array.isArray(change.change.fields) && 
      change.change.fields.length > 0
    );

    console.log(`✅ 有效記錄: ${validChanges.length} 條\n`);

    // 顯示每條記錄的結構
    validChanges.forEach((change, index) => {
      console.log(`📝 記錄 ${index + 1}:`);
      console.log(`  - tutorId: ${change.tutorId}`);
      console.log(`  - name: ${change.name}`);
      console.log(`  - email: ${change.email}`);
      console.log(`  - change.timestamp: ${change.change.timestamp}`);
      console.log(`  - change.fields: ${change.change.fields.join(', ')}`);
      console.log(`  - change.newValues: ${Object.keys(change.change.newValues).length} 個字段`);
      console.log(`  - change.oldValues: ${Object.keys(change.change.oldValues).length} 個字段`);
      console.log(`  - change.ipAddress: ${change.change.ipAddress || 'N/A'}`);
      console.log(`  - change.userAgent: ${change.change.userAgent ? '有數據' : 'N/A'}`);
      console.log('');
    });

    // 模擬前端期望的數據結構
    console.log('📦 前端期望的數據結構:');
    console.log(JSON.stringify(validChanges[0], null, 2));

    console.log('\n🎉 recent-changes API 測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testRecentChangesAPI();
