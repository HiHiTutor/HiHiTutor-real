const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testFixedAPI() {
  try {
    console.log('🧪 測試修復後的API邏輯...\n');

    // 模擬API的查詢邏輯
    const query = {
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    };

    const tutors = await User.find(query)
      .select('name email tutorId userId profileChangeLog createdAt')
      .sort({ 'profileChangeLog.timestamp': -1 })
      .limit(10);

    console.log(`📊 找到 ${tutors.length} 個有修改記錄的導師\n`);

    // 測試修復後的格式化邏輯
    const formattedChanges = tutors.map(tutor => {
      // 確保有有效的ID
      const validTutorId = tutor.tutorId || tutor.userId || `unknown_${tutor._id}`;
      
      return {
        tutorId: validTutorId,
        name: tutor.name || '未知姓名',
        email: tutor.email || '未知郵箱',
        changes: (tutor.profileChangeLog || []).map(change => ({
          timestamp: change.timestamp,
          fields: change.fields || [],
          oldValues: change.oldValues || {},
          newValues: change.newValues || {},
          ipAddress: change.ipAddress,
          userAgent: change.userAgent
        }))
      };
    }).filter(tutor => tutor.changes && tutor.changes.length > 0);

    console.log('✅ 格式化後的數據:');
    formattedChanges.forEach((tutor, index) => {
      console.log(`\n導師 ${index + 1}:`);
      console.log(`  - tutorId: ${tutor.tutorId}`);
      console.log(`  - name: ${tutor.name}`);
      console.log(`  - email: ${tutor.email}`);
      console.log(`  - changes count: ${tutor.changes.length}`);
      
      // 檢查每個修改記錄
      tutor.changes.forEach((change, changeIndex) => {
        console.log(`    📝 修改記錄 ${changeIndex + 1}:`);
        console.log(`      - timestamp: ${change.timestamp ? '有效' : '無效'}`);
        console.log(`      - fields: ${Array.isArray(change.fields) ? '有效數組' : '無效'}`);
        console.log(`      - oldValues: ${change.oldValues ? '有數據' : '無數據'}`);
        console.log(`      - newValues: ${change.newValues ? '有數據' : '無數據'}`);
      });
    });

    console.log('\n🎉 API邏輯測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行測試
testFixedAPI();
