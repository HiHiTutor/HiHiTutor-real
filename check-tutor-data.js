// 檢查導師 TU0104 的完整數據
const mongoose = require('mongoose');
require('dotenv').config();

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./backend/models/User');

async function checkTutorData() {
  try {
    console.log('🔍 查找導師 TU0104...');
    
    const tutor = await User.findOne({
      tutorId: 'TU0104',
      userType: 'tutor',
      isActive: true
    }).select('-password -refreshToken');
    
    if (!tutor) {
      console.log('❌ 找不到導師 TU0104');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name);
    console.log('🔍 完整導師數據:');
    console.log(JSON.stringify(tutor, null, 2));
    
    console.log('\n🔍 tutorProfile 詳細信息:');
    console.log(JSON.stringify(tutor.tutorProfile, null, 2));
    
    console.log('\n🔍 birthDate 信息:');
    console.log('- tutorProfile.birthDate:', tutor.tutorProfile?.birthDate);
    console.log('- 類型:', typeof tutor.tutorProfile?.birthDate);
    console.log('- 是否為 Date:', tutor.tutorProfile?.birthDate instanceof Date);
    
    console.log('\n🔍 teachingExperienceYears 信息:');
    console.log('- tutorProfile.teachingExperienceYears:', tutor.tutorProfile?.teachingExperienceYears);
    console.log('- 類型:', typeof tutor.tutorProfile?.teachingExperienceYears);
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTutorData();
