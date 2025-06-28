require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkSpecificTutor() {
  try {
    console.log('🔍 檢查特定導師帳號...');
    
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 資料庫連接成功');
    
    // 檢查導師帳號
    const tutorId = '685f9999dc484c30ad37cc43';
    const tutor = await User.findById(tutorId);
    
    if (tutor) {
      console.log('✅ 找到導師帳號:');
      console.log('- ID:', tutor._id);
      console.log('- 姓名:', tutor.name);
      console.log('- 用戶類型:', tutor.userType);
      console.log('- 狀態:', tutor.status);
      console.log('- 是否活躍:', tutor.isActive);
      console.log('- 個人資料狀態:', tutor.profileStatus);
      console.log('- 科目:', tutor.tutorProfile?.subjects);
      console.log('- 評分:', tutor.rating);
      console.log('- 是否精選:', tutor.isTop);
      console.log('- 是否VIP:', tutor.isVip);
    } else {
      console.log('❌ 找不到導師帳號');
    }
    
    // 檢查所有導師
    const allTutors = await User.find({ userType: 'tutor' });
    console.log(`\n📊 資料庫中總共有 ${allTutors.length} 位導師`);
    
    // 列出所有導師
    allTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.userType}) - 狀態: ${tutor.status} - 活躍: ${tutor.isActive}`);
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 已斷開資料庫連接');
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  }
}

checkSpecificTutor(); 