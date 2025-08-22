const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAllTutorChanges() {
  try {
    console.log('🔍 檢查所有導師修改記錄...\n');

    // 查找所有導師用戶
    const allTutors = await User.find({
      userType: { $in: ['tutor', 'organization'] }
    }).select('name email tutorId userId profileChangeLog createdAt');

    console.log(`📊 找到 ${allTutors.length} 個導師用戶\n`);

    // 分類導師
    const tutorsWithChanges = [];
    const tutorsWithoutChanges = [];
    const tutorsWithInvalidData = [];

    allTutors.forEach((tutor, index) => {
      console.log(`\n📋 導師 ${index + 1}:`);
      console.log(`  - 姓名: ${tutor.name || 'N/A'}`);
      console.log(`  - 郵箱: ${tutor.email || 'N/A'}`);
      console.log(`  - 導師ID: ${tutor.tutorId || 'N/A'}`);
      console.log(`  - 用戶ID: ${tutor.userId || 'N/A'}`);
      console.log(`  - 修改記錄數量: ${tutor.profileChangeLog?.length || 0}`);

      if (!tutor.profileChangeLog || !Array.isArray(tutor.profileChangeLog)) {
        console.log(`  ❌ 無效的 profileChangeLog 數據`);
        tutorsWithInvalidData.push(tutor);
      } else if (tutor.profileChangeLog.length === 0) {
        console.log(`  ⚠️ 沒有修改記錄`);
        tutorsWithoutChanges.push(tutor);
      } else {
        console.log(`  ✅ 有 ${tutor.profileChangeLog.length} 條修改記錄`);
        
        // 檢查每條修改記錄的完整性
        tutor.profileChangeLog.forEach((change, changeIndex) => {
          console.log(`    📝 修改記錄 ${changeIndex + 1}:`);
          console.log(`      - timestamp: ${change.timestamp || 'N/A'}`);
          console.log(`      - fields: ${Array.isArray(change.fields) ? change.fields.join(', ') : 'N/A'}`);
          console.log(`      - oldValues: ${change.oldValues ? '有數據' : 'N/A'}`);
          console.log(`      - newValues: ${change.newValues ? '有數據' : 'N/A'}`);
          console.log(`      - ipAddress: ${change.ipAddress || 'N/A'}`);
          console.log(`      - userAgent: ${change.userAgent || 'N/A'}`);
          
          // 檢查是否有問題的數據
          if (!change.timestamp || !change.fields || !Array.isArray(change.fields)) {
            console.log(`      ❌ 數據不完整！`);
          }
        });
        
        tutorsWithChanges.push(tutor);
      }
    });

    console.log('\n📊 統計結果:');
    console.log(`✅ 有修改記錄的導師: ${tutorsWithChanges.length}`);
    console.log(`⚠️ 沒有修改記錄的導師: ${tutorsWithoutChanges.length}`);
    console.log(`❌ 數據無效的導師: ${tutorsWithInvalidData.length}`);

    // 檢查有問題的數據
    if (tutorsWithInvalidData.length > 0) {
      console.log('\n🚨 發現數據問題的導師:');
      tutorsWithInvalidData.forEach((tutor, index) => {
        console.log(`  ${index + 1}. ${tutor.name || '未知'} (${tutor.tutorId || tutor.userId})`);
        console.log(`     profileChangeLog 類型: ${typeof tutor.profileChangeLog}`);
        console.log(`     profileChangeLog 值:`, tutor.profileChangeLog);
      });
    }

    // 模擬API返回的數據結構
    console.log('\n📦 模擬API返回數據結構:');
    tutorsWithChanges.forEach((tutor, index) => {
      const apiResponse = {
        tutorId: tutor.tutorId || tutor.userId,
        name: tutor.name,
        email: tutor.email,
        changes: tutor.profileChangeLog.map(change => ({
          timestamp: change.timestamp,
          fields: change.fields,
          oldValues: change.oldValues,
          newValues: change.newValues,
          ipAddress: change.ipAddress,
          userAgent: change.userAgent
        }))
      };
      
      console.log(`\n導師 ${index + 1} (${apiResponse.tutorId}):`);
      console.log(JSON.stringify(apiResponse, null, 2));
    });

    console.log('\n🎉 檢查完成！');

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行檢查
checkAllTutorChanges();
