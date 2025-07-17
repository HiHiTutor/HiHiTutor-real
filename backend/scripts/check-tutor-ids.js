const mongoose = require('mongoose');

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

const checkTutorIds = async () => {
  try {
    console.log('🔍 檢查導師 ID 排列...');
    
    // 查找所有導師，按 tutorId 排序
    const tutors = await User.find({ userType: 'tutor' })
      .select('userId tutorId name email')
      .sort({ tutorId: 1 });
    
    console.log(`📊 總共有 ${tutors.length} 個導師`);
    console.log('\n📋 導師 ID 列表 (按 tutorId 排序):');
    
    tutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name}`);
      console.log(`   - userId: ${tutor.userId}`);
      console.log(`   - tutorId: ${tutor.tutorId}`);
      console.log(`   - email: ${tutor.email}`);
      console.log('');
    });
    
    // 檢查 ID 格式
    console.log('🔍 ID 格式分析:');
    
    const userIdPatterns = tutors.map(t => t.userId).filter(id => id);
    const tutorIdPatterns = tutors.map(t => t.tutorId).filter(id => id);
    
    console.log(`- userId 數量: ${userIdPatterns.length}`);
    console.log(`- tutorId 數量: ${tutorIdPatterns.length}`);
    
    if (userIdPatterns.length > 0) {
      console.log(`- userId 範圍: ${Math.min(...userIdPatterns.map(id => parseInt(id) || 0))} - ${Math.max(...userIdPatterns.map(id => parseInt(id) || 0))}`);
    }
    
    if (tutorIdPatterns.length > 0) {
      console.log(`- tutorId 範圍: ${tutorIdPatterns[0]} - ${tutorIdPatterns[tutorIdPatterns.length - 1]}`);
    }
    
    // 檢查是否有重複的 ID
    const duplicateUserIds = userIdPatterns.filter((id, index) => userIdPatterns.indexOf(id) !== index);
    const duplicateTutorIds = tutorIdPatterns.filter((id, index) => tutorIdPatterns.indexOf(id) !== index);
    
    if (duplicateUserIds.length > 0) {
      console.log(`⚠️ 發現重複的 userId: ${duplicateUserIds.join(', ')}`);
    }
    
    if (duplicateTutorIds.length > 0) {
      console.log(`⚠️ 發現重複的 tutorId: ${duplicateTutorIds.join(', ')}`);
    }
    
    console.log('\n✅ 檢查完成！');
    
  } catch (error) {
    console.error('❌ 檢查時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
};

checkTutorIds(); 