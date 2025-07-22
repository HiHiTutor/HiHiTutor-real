const mongoose = require('mongoose');
require('dotenv').config();

// 連接到 MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
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

const testTutorProfileData = async () => {
  try {
    await connectDB();
    
    // 載入 User model
    const User = require('../models/User');
    
    // 查找所有導師
    const tutors = await User.find({ userType: 'tutor' }).limit(5);
    
    console.log(`\n📊 找到 ${tutors.length} 個導師，檢查前 5 個的資料：`);
    
    tutors.forEach((tutor, index) => {
      console.log(`\n--- 導師 ${index + 1}: ${tutor.tutorId || '無 tutorId'} ---`);
      console.log('基本資料:');
      console.log('- 姓名:', tutor.name);
      console.log('- 用戶類型:', tutor.userType);
      
      if (tutor.tutorProfile) {
        console.log('\n📋 tutorProfile 欄位:');
        console.log('- teachingMode:', tutor.tutorProfile.teachingMode || '❌ 無資料');
        console.log('- teachingSubModes:', tutor.tutorProfile.teachingSubModes || '❌ 無資料');
        console.log('- sessionRate:', tutor.tutorProfile.sessionRate || '❌ 無資料');
        console.log('- region:', tutor.tutorProfile.region || '❌ 無資料');
        console.log('- subRegions:', tutor.tutorProfile.subRegions || '❌ 無資料');
        console.log('- category:', tutor.tutorProfile.category || '❌ 無資料');
        console.log('- subCategory:', tutor.tutorProfile.subCategory || '❌ 無資料');
        console.log('- subjects:', tutor.tutorProfile.subjects || '❌ 無資料');
        console.log('- educationLevel:', tutor.tutorProfile.educationLevel || '❌ 無資料');
        console.log('- teachingExperienceYears:', tutor.tutorProfile.teachingExperienceYears || '❌ 無資料');
      } else {
        console.log('❌ 沒有 tutorProfile 資料');
      }
    });
    
    // 檢查有多少導師有完整的 tutorProfile 資料
    const tutorsWithProfile = await User.countDocuments({
      userType: 'tutor',
      'tutorProfile.teachingMode': { $exists: true, $ne: '' }
    });
    
    const totalTutors = await User.countDocuments({ userType: 'tutor' });
    
    console.log(`\n📈 統計資料:`);
    console.log(`- 總導師數: ${totalTutors}`);
    console.log(`- 有 teachingMode 的導師: ${tutorsWithProfile}`);
    console.log(`- 完整資料比例: ${((tutorsWithProfile / totalTutors) * 100).toFixed(1)}%`);
    
    // 如果沒有導師有完整資料，建議添加一些測試資料
    if (tutorsWithProfile === 0) {
      console.log('\n⚠️ 沒有導師有完整的 tutorProfile 資料！');
      console.log('建議添加一些測試資料...');
      
      // 為第一個導師添加測試資料
      if (tutors.length > 0) {
        const firstTutor = tutors[0];
        console.log(`\n🔄 為導師 ${firstTutor.tutorId || firstTutor.name} 添加測試資料...`);
        
        const updateResult = await User.findByIdAndUpdate(
          firstTutor._id,
          {
            $set: {
              'tutorProfile.teachingMode': 'online',
              'tutorProfile.teachingSubModes': ['Zoom', 'Google Meet'],
              'tutorProfile.sessionRate': 300,
              'tutorProfile.region': 'central',
              'tutorProfile.subRegions': ['causeway-bay', 'mong-kok'],
              'tutorProfile.category': 'primary-secondary',
              'tutorProfile.subCategory': 'primary',
              'tutorProfile.subjects': ['primary-chinese', 'primary-english', 'primary-math'],
              'tutorProfile.educationLevel': '大學畢業',
              'tutorProfile.teachingExperienceYears': 3
            }
          },
          { new: true }
        );
        
        if (updateResult) {
          console.log('✅ 測試資料添加成功！');
          console.log('現在可以重新測試前端頁面了。');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程中出錯:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 連接已關閉');
  }
};

// 執行測試
testTutorProfileData(); 