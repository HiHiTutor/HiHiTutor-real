// 為導師 TU0104 添加出生日期數據
const mongoose = require('mongoose');
require('dotenv').config();

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function updateTutorBirthDate() {
  try {
    console.log('🔍 查找導師 TU0104...');
    
    const tutor = await User.findOne({
      tutorId: 'TU0104',
      userType: 'tutor',
      isActive: true
    });
    
    if (!tutor) {
      console.log('❌ 找不到導師 TU0104');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name);
    console.log('🔍 當前 tutorProfile:', tutor.tutorProfile);
    
    // 添加出生日期 (1993年2月19日，對應32歲)
    const birthDate = new Date('1993-02-19');
    
    // 更新導師的出生日期
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      {
        $set: {
          'tutorProfile.birthDate': birthDate
        }
      },
      { new: true }
    );
    
    console.log('✅ 更新成功！');
    console.log('🔍 更新後的 tutorProfile:', updatedTutor.tutorProfile);
    console.log('🔍 出生日期:', updatedTutor.tutorProfile.birthDate);
    
    // 計算年齡
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    console.log('🎂 計算年齡:', actualAge, '歲');
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateTutorBirthDate();
