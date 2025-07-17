const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster');

const User = require('../models/User');

const showSummary = async () => {
  try {
    const tutors = await User.find({ userType: 'tutor' })
      .select('tutorId name')
      .sort({ tutorId: 1 });
    
    console.log(`📊 總導師數量: ${tutors.length}`);
    console.log('\n📋 tutorId 分佈:');
    
    // 按格式分組
    const formatGroups = {};
    tutors.forEach(tutor => {
      if (tutor.tutorId) {
        const format = tutor.tutorId.length === 6 ? 'TXXXXX' : '其他';
        if (!formatGroups[format]) formatGroups[format] = [];
        formatGroups[format].push(tutor.tutorId);
      }
    });
    
    Object.keys(formatGroups).forEach(format => {
      console.log(`\n${format} 格式 (${formatGroups[format].length} 個):`);
      console.log(`範圍: ${formatGroups[format][0]} - ${formatGroups[format][formatGroups[format].length - 1]}`);
    });
    
    console.log('\n✅ 檢查完成！');
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
  }
};

showSummary(); 