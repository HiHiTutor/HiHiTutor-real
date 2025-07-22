const mongoose = require('mongoose');

// 連接到 MongoDB
const connectDB = async () => {
  try {
    const uri = 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

const addTU0018ProfileData = async () => {
  try {
    await connectDB();
    
    // 載入 User model
    const User = require('../models/User');
    
    // 查找 TU0018
    const tutor = await User.findOne({ tutorId: 'TU0018', userType: 'tutor' });
    
    if (!tutor) {
      console.log('❌ 找不到導師 TU0018');
      return;
    }
    
    console.log(`\n📊 找到導師 TU0018，為其添加測試資料：`);
    
    const testData = {
      teachingMode: 'both',
      teachingSubModes: ['Zoom', 'Google Meet', '面對面教學'],
      sessionRate: 450,
      region: 'central',
      subRegions: ['causeway-bay', 'mong-kok', 'sha-tin', 'tai-po'],
      category: 'primary-secondary',
      subCategory: 'secondary',
      subjects: ['secondary-chinese', 'secondary-english', 'secondary-math', 'secondary-physics'],
      educationLevel: '碩士畢業',
      teachingExperienceYears: 6
    };
    
    console.log(`\n🔄 為導師 TU0018 添加測試資料...`);
    
    const updateResult = await User.findByIdAndUpdate(
      tutor._id,
      {
        $set: {
          'tutorProfile.teachingMode': testData.teachingMode,
          'tutorProfile.teachingSubModes': testData.teachingSubModes,
          'tutorProfile.sessionRate': testData.sessionRate,
          'tutorProfile.region': testData.region,
          'tutorProfile.subRegions': testData.subRegions,
          'tutorProfile.category': testData.category,
          'tutorProfile.subCategory': testData.subCategory,
          'tutorProfile.subjects': testData.subjects,
          'tutorProfile.educationLevel': testData.educationLevel,
          'tutorProfile.teachingExperienceYears': testData.teachingExperienceYears
        }
      },
      { new: true }
    );
    
    if (updateResult) {
      console.log('✅ 測試資料添加成功！');
      console.log('- 補習形式:', testData.teachingMode);
      console.log('- 教學方式:', testData.teachingSubModes.join(', '));
      console.log('- 每堂收費:', `$${testData.sessionRate}`);
      console.log('- 主要地區:', testData.region);
      console.log('- 教授地區:', testData.subRegions.join(', '));
      console.log('- 課程分類:', testData.category);
      console.log('- 子分類:', testData.subCategory);
      console.log('- 可教科目:', testData.subjects.join(', '));
      console.log('- 學歷:', testData.educationLevel);
      console.log('- 教學經驗:', `${testData.teachingExperienceYears} 年`);
    }
    
    console.log('\n🎉 TU0018 測試資料添加完成！');
    console.log('現在可以訪問 https://hi-hi-tutor-real.vercel.app/tutors/TU0018 來查看效果了。');
    
  } catch (error) {
    console.error('❌ 添加測試資料時出錯:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 連接已關閉');
  }
};

// 執行腳本
addTU0018ProfileData(); 