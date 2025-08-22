const mongoose = require('mongoose');
const User = require('./models/User');

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testTutorChangeLog() {
  try {
    console.log('🔍 測試導師修改記錄功能...');
    
    // 查找一個導師用戶
    const tutor = await User.findOne({ userType: 'tutor' });
    
    if (!tutor) {
      console.log('❌ 找不到導師用戶，請先創建一個導師');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name, 'ID:', tutor._id);
    console.log('📊 當前 profileChangeLog 長度:', tutor.profileChangeLog?.length || 0);
    
    // 模擬更新導師資料
    const updateData = {
      name: tutor.name + ' (已更新)',
      'tutorProfile.introduction': '這是測試更新 - ' + new Date().toLocaleString(),
      'tutorProfile.sessionRate': (tutor.tutorProfile?.sessionRate || 100) + 50
    };
    
    console.log('📝 準備更新的數據:', updateData);
    
    // 記錄修改歷史
    const changeLog = {
      timestamp: new Date(),
      fields: Object.keys(updateData),
      oldValues: {},
      newValues: updateData,
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    };
    
    // 獲取舊值用於比較
    for (const field of Object.keys(updateData)) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        changeLog.oldValues[field] = tutor[parent]?.[child];
      } else {
        changeLog.oldValues[field] = tutor[field];
      }
    }
    
    console.log('📋 修改記錄:', changeLog);
    
    // 更新導師資料
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      { 
        $set: updateData,
        $push: { 
          profileChangeLog: changeLog
        }
      },
      { new: true }
    );
    
    console.log('✅ 導師資料更新成功');
    console.log('📊 更新後 profileChangeLog 長度:', updatedTutor.profileChangeLog?.length || 0);
    
    // 顯示最新的修改記錄
    if (updatedTutor.profileChangeLog && updatedTutor.profileChangeLog.length > 0) {
      const latestChange = updatedTutor.profileChangeLog[updatedTutor.profileChangeLog.length - 1];
      console.log('🆕 最新的修改記錄:');
      console.log('  - 時間:', latestChange.timestamp);
      console.log('  - 修改字段:', latestChange.fields);
      console.log('  - 舊值:', latestChange.oldValues);
      console.log('  - 新值:', latestChange.newValues);
      console.log('  - IP地址:', latestChange.ipAddress);
      console.log('  - 用戶代理:', latestChange.userAgent);
    }
    
    // 測試查詢修改記錄
    console.log('\n🔍 測試查詢修改記錄...');
    
    const tutorsWithChanges = await User.find({
      userType: 'tutor',
      profileChangeLog: { $exists: true, $ne: [] }
    }).select('name email tutorId userId profileChangeLog');
    
    console.log('📊 有修改記錄的導師數量:', tutorsWithChanges.length);
    
    tutorsWithChanges.forEach(tutor => {
      console.log(`\n👤 ${tutor.name} (${tutor.tutorId || tutor.userId}):`);
      console.log(`   📧 ${tutor.email}`);
      console.log(`   📝 修改次數: ${tutor.profileChangeLog.length}`);
      
      tutor.profileChangeLog.forEach((change, index) => {
        console.log(`     ${index + 1}. ${change.timestamp} - 修改了 ${change.fields.length} 個字段`);
        console.log(`        IP: ${change.ipAddress}, 用戶代理: ${change.userAgent}`);
      });
    });
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
  }
}

// 運行測試
testTutorChangeLog();
