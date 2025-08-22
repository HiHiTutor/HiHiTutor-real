const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkNotificationDataStructure() {
  try {
    console.log('🔍 檢查通知API數據結構...\n');

    // 查找有修改記錄的導師
    const tutors = await User.find({
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    }).select('name email tutorId userId profileChangeLog createdAt');

    console.log(`📊 找到 ${tutors.length} 個有修改記錄的導師\n`);

    if (tutors.length === 0) {
      console.log('❌ 沒有找到有修改記錄的導師');
      return;
    }

    // 檢查第一個導師的數據結構
    const firstTutor = tutors[0];
    console.log('📋 第一個導師信息:');
    console.log('  - 姓名:', firstTutor.name);
    console.log('  - 郵箱:', firstTutor.email);
    console.log('  - 導師ID:', firstTutor.tutorId);
    console.log('  - 用戶ID:', firstTutor.userId);
    console.log('  - 修改記錄數量:', firstTutor.profileChangeLog.length);

    // 檢查修改記錄的結構
    if (firstTutor.profileChangeLog.length > 0) {
      const firstChange = firstTutor.profileChangeLog[0];
      console.log('\n🔍 第一個修改記錄的結構:');
      console.log('  - timestamp:', firstChange.timestamp);
      console.log('  - fields:', firstChange.fields);
      console.log('  - oldValues:', firstChange.oldValues);
      console.log('  - newValues:', firstChange.newValues);
      console.log('  - ipAddress:', firstChange.ipAddress);
      console.log('  - userAgent:', firstChange.userAgent);
    }

    // 模擬API返回的數據結構
    const mockApiResponse = tutors.map(tutor => ({
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
    }));

    console.log('\n📦 模擬的API返回數據結構:');
    console.log(JSON.stringify(mockApiResponse[0], null, 2));

    // 檢查是否有問題的數據
    console.log('\n⚠️ 檢查數據完整性...');
    mockApiResponse.forEach((tutor, index) => {
      if (!tutor.tutorId) {
        console.log(`❌ 導師 ${index + 1}: 缺少 tutorId`);
      }
      if (!tutor.name) {
        console.log(`❌ 導師 ${index + 1}: 缺少 name`);
      }
      if (!tutor.changes || !Array.isArray(tutor.changes)) {
        console.log(`❌ 導師 ${index + 1}: changes 不是數組`);
      } else {
        tutor.changes.forEach((change, changeIndex) => {
          if (!change.timestamp) {
            console.log(`❌ 導師 ${index + 1} 修改記錄 ${changeIndex + 1}: 缺少 timestamp`);
          }
          if (!change.fields || !Array.isArray(change.fields)) {
            console.log(`❌ 導師 ${index + 1} 修改記錄 ${changeIndex + 1}: fields 不是數組`);
          }
        });
      }
    });

    console.log('\n🎉 數據結構檢查完成！');

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 運行檢查
checkNotificationDataStructure();
