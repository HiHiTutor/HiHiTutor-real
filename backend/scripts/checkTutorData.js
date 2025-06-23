const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ 已連接到 MongoDB'))
  .catch(err => console.error('❌ MongoDB 連接失敗:', err));

// 引入 User 模型
const User = require('../models/User');

async function checkTutorData() {
  try {
    console.log('🔍 檢查導師數據...');
    
    // 查找 userId 為 1000002 的導師
    const tutor = await User.findOne({ userId: '1000002' });
    
    if (!tutor) {
      console.log('❌ 找不到導師 userId: 1000002');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name);
    console.log('📊 完整數據:');
    console.log(JSON.stringify(tutor, null, 2));
    
    console.log('\n🔍 檢查 tutorProfile 字段:');
    if (tutor.tutorProfile) {
      console.log('tutorProfile 存在');
      console.log('subjects:', tutor.tutorProfile.subjects);
      console.log('teachingAreas:', tutor.tutorProfile.teachingAreas);
      console.log('teachingMethods:', tutor.tutorProfile.teachingMethods);
      console.log('teachingExperienceYears:', tutor.tutorProfile.teachingExperienceYears);
      console.log('educationLevel:', tutor.tutorProfile.educationLevel);
      console.log('introduction:', tutor.tutorProfile.introduction);
      console.log('sessionRate:', tutor.tutorProfile.sessionRate);
      console.log('availableTime:', tutor.tutorProfile.availableTime);
      console.log('documents:', tutor.tutorProfile.documents);
    } else {
      console.log('❌ tutorProfile 不存在');
    }
    
  } catch (error) {
    console.error('❌ 檢查數據時出錯:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTutorData(); 