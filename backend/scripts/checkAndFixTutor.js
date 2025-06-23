const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkAndFixTutor() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');

    // 檢查所有用戶
    const users = await User.find({});
    console.log(`📊 總共有 ${users.length} 個用戶`);

    // 顯示所有用戶的基本資訊
    users.forEach(user => {
      console.log(`👤 ${user.name} (${user.email}) - userType: ${user.userType}, userId: ${user.userId}`);
    });

    // 檢查導師數量
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`\n🎓 導師數量: ${tutors.length}`);

    if (tutors.length === 0) {
      console.log('❌ 沒有找到導師，需要創建測試導師');
      
      // 創建一個測試導師
      const testTutor = new User({
        userId: 'TUTOR001',
        name: '測試導師',
        email: 'tutor@test.com',
        phone: '12345678',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        userType: 'tutor',
        role: 'user',
        tutorProfile: {
          displayPublic: true,
          gender: 'male',
          teachingExperienceYears: 5,
          educationLevel: '大學',
          subjects: ['數學', '物理'],
          sessionRate: 300,
          introduction: '我是一位經驗豐富的導師',
          applicationStatus: 'approved'
        }
      });

      await testTutor.save();
      console.log('✅ 已創建測試導師');
    } else {
      // 顯示導師詳情
      tutors.forEach(tutor => {
        console.log(`\n🎓 導師: ${tutor.name}`);
        console.log(`   userId: ${tutor.userId}`);
        console.log(`   email: ${tutor.email}`);
        console.log(`   userType: ${tutor.userType}`);
        console.log(`   tutorProfile:`, tutor.tutorProfile);
      });
    }

    // 檢查是否有 userType 為 'student' 但想要升級為導師的用戶
    const students = await User.find({ userType: 'student' });
    console.log(`\n📚 學生數量: ${students.length}`);

    if (students.length > 0) {
      console.log('\n💡 如果要將某個學生升級為導師，請提供該用戶的 userId');
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  checkAndFixTutor();
}

module.exports = { checkAndFixTutor }; 