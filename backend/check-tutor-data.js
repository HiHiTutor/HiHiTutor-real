const mongoose = require('mongoose');
const User = require('./models/User');

// 連接到數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAndFixTutorData() {
  try {
    console.log('🔍 檢查導師資料...');
    
    const tutorId = '688334224593e6a0b99d6870';
    const tutor = await User.findById(tutorId);
    
    if (!tutor) {
      console.log('❌ 找不到導師');
      return;
    }
    
    console.log('📋 導師基本資料:');
    console.log('- 名稱:', tutor.name);
    console.log('- 用戶類型:', tutor.userType);
    console.log('- 狀態:', tutor.profileStatus);
    console.log('- 備註:', tutor.remarks);
    
    console.log('\n📋 導師個人資料:');
    console.log('- sessionRate:', tutor.tutorProfile?.sessionRate);
    console.log('- subjects:', tutor.tutorProfile?.subjects);
    console.log('- 完整 tutorProfile:', JSON.stringify(tutor.tutorProfile, null, 2));
    
    // 檢查是否需要修復
    const needsFix = !tutor.tutorProfile?.sessionRate || 
                    !tutor.tutorProfile?.subjects || 
                    tutor.tutorProfile?.subjects?.length === 0;
    
    if (needsFix) {
      console.log('\n🔧 需要修復資料...');
      
      // 設置默認值
      if (!tutor.tutorProfile) {
        tutor.tutorProfile = {};
      }
      
      if (!tutor.tutorProfile.sessionRate) {
        tutor.tutorProfile.sessionRate = 200; // 默認堂費
        console.log('✅ 設置默認 sessionRate: 200');
      }
      
      if (!tutor.tutorProfile.subjects || tutor.tutorProfile.subjects.length === 0) {
        tutor.tutorProfile.subjects = ['未指定']; // 默認科目
        console.log('✅ 設置默認 subjects: ["未指定"]');
      }
      
      // 保存修復後的資料
      await tutor.save();
      console.log('✅ 資料修復完成');
    } else {
      console.log('✅ 資料正常，無需修復');
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAndFixTutorData(); 