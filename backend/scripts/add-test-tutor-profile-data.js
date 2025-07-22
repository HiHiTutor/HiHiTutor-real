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

const addTestTutorProfileData = async () => {
  try {
    await connectDB();
    
    // 載入 User model
    const User = require('../models/User');
    
    // 查找前 3 個導師
    const tutors = await User.find({ userType: 'tutor' }).limit(3);
    
    console.log(`\n📊 找到 ${tutors.length} 個導師，為他們添加測試資料：`);
    
    const testData = [
      {
        teachingMode: 'online',
        teachingSubModes: ['Zoom', 'Google Meet'],
        sessionRate: 300,
        region: 'central',
        subRegions: ['causeway-bay', 'mong-kok'],
        category: 'primary-secondary',
        subCategory: 'primary',
        subjects: ['primary-chinese', 'primary-english', 'primary-math'],
        educationLevel: '大學畢業',
        teachingExperienceYears: 3
      },
      {
        teachingMode: 'in-person',
        teachingSubModes: ['面對面教學'],
        sessionRate: 400,
        region: 'causeway-bay',
        subRegions: ['central', 'mong-kok', 'sha-tin'],
        category: 'primary-secondary',
        subCategory: 'secondary',
        subjects: ['secondary-chinese', 'secondary-english', 'secondary-math'],
        educationLevel: '碩士畢業',
        teachingExperienceYears: 5
      },
      {
        teachingMode: 'both',
        teachingSubModes: ['Zoom', 'Google Meet', '面對面教學'],
        sessionRate: 350,
        region: 'mong-kok',
        subRegions: ['central', 'causeway-bay', 'sha-tin', 'tai-po'],
        category: 'interest',
        subCategory: 'art',
        subjects: ['art', 'music', 'primary-chinese'],
        educationLevel: '大學畢業',
        teachingExperienceYears: 2
      }
    ];
    
    for (let i = 0; i < tutors.length; i++) {
      const tutor = tutors[i];
      const data = testData[i];
      
      console.log(`\n🔄 為導師 ${tutor.tutorId || tutor.name} 添加測試資料...`);
      
      const updateResult = await User.findByIdAndUpdate(
        tutor._id,
        {
          $set: {
            'tutorProfile.teachingMode': data.teachingMode,
            'tutorProfile.teachingSubModes': data.teachingSubModes,
            'tutorProfile.sessionRate': data.sessionRate,
            'tutorProfile.region': data.region,
            'tutorProfile.subRegions': data.subRegions,
            'tutorProfile.category': data.category,
            'tutorProfile.subCategory': data.subCategory,
            'tutorProfile.subjects': data.subjects,
            'tutorProfile.educationLevel': data.educationLevel,
            'tutorProfile.teachingExperienceYears': data.teachingExperienceYears
          }
        },
        { new: true }
      );
      
      if (updateResult) {
        console.log('✅ 測試資料添加成功！');
        console.log('- 補習形式:', data.teachingMode);
        console.log('- 教學方式:', data.teachingSubModes.join(', '));
        console.log('- 每堂收費:', `$${data.sessionRate}`);
        console.log('- 主要地區:', data.region);
        console.log('- 教授地區:', data.subRegions.join(', '));
        console.log('- 課程分類:', data.category);
        console.log('- 子分類:', data.subCategory);
        console.log('- 可教科目:', data.subjects.join(', '));
        console.log('- 學歷:', data.educationLevel);
        console.log('- 教學經驗:', `${data.teachingExperienceYears} 年`);
      }
    }
    
    console.log('\n🎉 所有測試資料添加完成！');
    console.log('現在可以訪問 https://hi-hi-tutor-real.vercel.app/tutors/[tutorId] 來查看效果了。');
    
  } catch (error) {
    console.error('❌ 添加測試資料時出錯:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 連接已關閉');
  }
};

// 執行腳本
addTestTutorProfileData(); 