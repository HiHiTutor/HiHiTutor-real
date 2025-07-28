const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function testTutorUpdateRequests() {
  try {
    console.log('🔍 檢查所有導師的 pendingProfile 狀態...');
    
    // 查找所有導師
    const tutors = await User.find({ userType: 'tutor' }).select('name userId pendingProfile profileStatus');
    
    console.log(`📊 找到 ${tutors.length} 個導師`);
    
    tutors.forEach((tutor, index) => {
      console.log(`\n${index + 1}. 導師: ${tutor.name} (${tutor.userId})`);
      console.log(`   profileStatus: ${tutor.profileStatus}`);
      console.log(`   hasPendingProfile: ${!!tutor.pendingProfile}`);
      
      if (tutor.pendingProfile) {
        console.log(`   pendingProfile.status: ${tutor.pendingProfile.status}`);
        console.log(`   pendingProfile.name: ${tutor.pendingProfile.name}`);
        console.log(`   pendingProfile.submittedAt: ${tutor.pendingProfile.submittedAt}`);
      }
    });
    
    // 查找有待審批申請的導師
    const pendingTutors = await User.find({
      userType: 'tutor',
      'pendingProfile.status': 'pending'
    }).select('name userId pendingProfile');
    
    console.log(`\n🔍 有待審批申請的導師: ${pendingTutors.length} 個`);
    
    pendingTutors.forEach((tutor, index) => {
      console.log(`\n${index + 1}. 待審批導師: ${tutor.name} (${tutor.userId})`);
      console.log(`   pendingProfile.name: ${tutor.pendingProfile.name}`);
      console.log(`   pendingProfile.submittedAt: ${tutor.pendingProfile.submittedAt}`);
    });
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTutorUpdateRequests(); 