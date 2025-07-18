const mongoose = require('mongoose');
const User = require('../models/User');

// 連接雲端數據庫
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 快速添加缺失的subjects
const quickAddMissingSubjects = async () => {
  try {
    console.log('🔍 快速檢查並添加缺失的subjects...');
    
    // 獲取所有導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總共找到 ${tutors.length} 位導師`);
    
    // 找出沒有subjects的導師
    const tutorsWithoutSubjects = tutors.filter(tutor => 
      !tutor.tutorProfile?.subjects || tutor.tutorProfile.subjects.length === 0
    );
    
    console.log(`⚠️  沒有subjects的導師: ${tutorsWithoutSubjects.length} 個`);
    
    // 為沒有subjects的導師添加subjects
    const subjectsToAdd = [
      'primary-chinese', 'primary-english', 'primary-math', 'primary-general',
      'primary-stem', 'primary-all', 'secondary-ls', 'secondary-dse',
      'art', 'music', 'dance', 'drama', 'programming', 'foreign-language',
      'magic-chess', 'photography', 'uni-liberal', 'uni-math', 'uni-economics',
      'uni-it', 'uni-business', 'uni-engineering', 'uni-thesis',
      'business-english', 'conversation', 'chinese-language', 'second-language',
      'computer-skills', 'exam-prep'
    ];
    
    for (let i = 0; i < tutorsWithoutSubjects.length; i++) {
      const tutor = tutorsWithoutSubjects[i];
      const subject = subjectsToAdd[i % subjectsToAdd.length];
      
      await User.findByIdAndUpdate(tutor._id, {
        'tutorProfile.subjects': [subject]
      });
      
      console.log(`✅ ${tutor.name}: 添加 ${subject}`);
    }
    
    console.log(`\n🎉 完成！為 ${tutorsWithoutSubjects.length} 個導師添加了subjects。`);
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  await quickAddMissingSubjects();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
};

// 執行腳本
if (require.main === module) {
  main().catch(console.error);
} 