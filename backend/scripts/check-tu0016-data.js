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

const checkTU0016Data = async () => {
  try {
    await connectDB();
    
    // 載入 User model
    const User = require('../models/User');
    
    // 查找 TU0016
    const tutor = await User.findOne({ tutorId: 'TU0016', userType: 'tutor' });
    
    if (!tutor) {
      console.log('❌ 找不到導師 TU0016');
      return;
    }
    
    console.log(`\n📊 導師 TU0016 的資料：`);
    console.log('- Tutor ID:', tutor.tutorId);
    console.log('- User ID:', tutor.userId);
    console.log('- Name:', tutor.name);
    console.log('- User Type:', tutor.userType);
    
    console.log('\n📋 TutorProfile 資料：');
    if (tutor.tutorProfile) {
      console.log('- 補習形式:', tutor.tutorProfile.teachingMode || '未設定');
      console.log('- 教學方式:', tutor.tutorProfile.teachingSubModes || '未設定');
      console.log('- 每堂收費:', tutor.tutorProfile.sessionRate || '未設定');
      console.log('- 主要地區:', tutor.tutorProfile.region || '未設定');
      console.log('- 教授地區:', tutor.tutorProfile.subRegions || '未設定');
      console.log('- 課程分類:', tutor.tutorProfile.category || '未設定');
      console.log('- 子分類:', tutor.tutorProfile.subCategory || '未設定');
      console.log('- 可教科目:', tutor.tutorProfile.subjects || '未設定');
      console.log('- 學歷:', tutor.tutorProfile.educationLevel || '未設定');
      console.log('- 教學經驗:', tutor.tutorProfile.teachingExperienceYears || '未設定');
    } else {
      console.log('❌ 沒有 tutorProfile 資料');
    }
    
    console.log('\n🔍 完整的 tutorProfile 物件：');
    console.log(JSON.stringify(tutor.tutorProfile, null, 2));
    
  } catch (error) {
    console.error('❌ 檢查資料時出錯:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 連接已關閉');
  }
};

// 執行腳本
checkTU0016Data(); 