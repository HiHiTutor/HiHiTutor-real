const mongoose = require('mongoose');
require('dotenv').config();

// 連接 MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 連接 MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 修復導師資料
const fixTutorData = async () => {
  try {
    const User = require('../models/User');
    
    console.log('\n🔧 修復導師資料');
    console.log('=' .repeat(60));
    
    // 1. 獲取所有導師
    const allTutors = await User.find({ userType: 'tutor' }).lean();
    console.log(`📋 找到 ${allTutors.length} 個導師需要修復`);
    
    if (allTutors.length === 0) {
      console.log('❌ 沒有找到導師資料');
      return;
    }
    
    // 2. 修復每個導師的資料
    let fixedCount = 0;
    
    for (const tutor of allTutors) {
      console.log(`\n🔧 修復導師: ${tutor.name || '未命名'} (${tutor._id})`);
      
      const updateData = {};
      let hasUpdates = false;
      
      // 修復基本欄位
      if (tutor.status !== 'active') {
        updateData.status = 'active';
        console.log(`  ✅ 修復 status: ${tutor.status} → active`);
        hasUpdates = true;
      }
      
      if (tutor.isActive !== true) {
        updateData.isActive = true;
        console.log(`  ✅ 修復 isActive: ${tutor.isActive} → true`);
        hasUpdates = true;
      }
      
      if (tutor.profileStatus !== 'approved') {
        updateData.profileStatus = 'approved';
        console.log(`  ✅ 修復 profileStatus: ${tutor.profileStatus} → approved`);
        hasUpdates = true;
      }
      
      if (!tutor.rating && tutor.rating !== 0) {
        updateData.rating = Math.floor(Math.random() * 5) + 1; // 1-5 隨機評分
        console.log(`  ✅ 設置 rating: ${updateData.rating}`);
        hasUpdates = true;
      }
      
      // 修復 tutorProfile 欄位
      if (!tutor.tutorProfile) {
        updateData.tutorProfile = {
          subjects: ['數學', '英文'], // 預設科目
          teachingExperienceYears: 2,
          educationLevel: '大學',
          introduction: '資深導師，教學經驗豐富',
          sessionRate: 200
        };
        console.log(`  ✅ 創建 tutorProfile`);
        hasUpdates = true;
      } else {
        // 修復現有的 tutorProfile
        const profileUpdates = {};
        
        if (!tutor.tutorProfile.subjects || tutor.tutorProfile.subjects.length === 0) {
          profileUpdates['tutorProfile.subjects'] = ['數學', '英文'];
          console.log(`  ✅ 修復 tutorProfile.subjects`);
          hasUpdates = true;
        }
        
        if (!tutor.tutorProfile.teachingExperienceYears) {
          profileUpdates['tutorProfile.teachingExperienceYears'] = 2;
          console.log(`  ✅ 設置 tutorProfile.teachingExperienceYears: 2`);
          hasUpdates = true;
        }
        
        if (!tutor.tutorProfile.educationLevel) {
          profileUpdates['tutorProfile.educationLevel'] = '大學';
          console.log(`  ✅ 設置 tutorProfile.educationLevel: 大學`);
          hasUpdates = true;
        }
        
        if (!tutor.tutorProfile.introduction) {
          profileUpdates['tutorProfile.introduction'] = '資深導師，教學經驗豐富';
          console.log(`  ✅ 設置 tutorProfile.introduction`);
          hasUpdates = true;
        }
        
        if (!tutor.tutorProfile.sessionRate) {
          profileUpdates['tutorProfile.sessionRate'] = 200;
          console.log(`  ✅ 設置 tutorProfile.sessionRate: 200`);
          hasUpdates = true;
        }
        
        Object.assign(updateData, profileUpdates);
      }
      
      // 設置一些導師為 featured（精選）
      if (!tutor.isTop && !tutor.isVip) {
        // 隨機選擇一些導師設為精選
        if (Math.random() < 0.4) { // 40% 機率設為精選
          updateData.isTop = true;
          console.log(`  ✅ 設置為精選導師 (isTop: true)`);
          hasUpdates = true;
        }
      }
      
      // 執行更新
      if (hasUpdates) {
        try {
          await User.findByIdAndUpdate(tutor._id, { $set: updateData });
          console.log(`  ✅ 成功更新導師資料`);
          fixedCount++;
        } catch (updateError) {
          console.error(`  ❌ 更新失敗:`, updateError.message);
        }
      } else {
        console.log(`  ✅ 導師資料已完整，無需修復`);
      }
    }
    
    // 3. 總結
    console.log('\n📊 修復總結:');
    console.log('=' .repeat(60));
    console.log(`總導師數量: ${allTutors.length}`);
    console.log(`成功修復: ${fixedCount} 個導師`);
    console.log(`無需修復: ${allTutors.length - fixedCount} 個導師`);
    
    // 4. 驗證修復結果
    console.log('\n🔍 驗證修復結果:');
    const updatedTutors = await User.find({ userType: 'tutor' }).lean();
    
    const featuredTutors = updatedTutors.filter(t => t.isTop || t.isVip);
    const activeTutors = updatedTutors.filter(t => t.isActive === true);
    const approvedTutors = updatedTutors.filter(t => t.profileStatus === 'approved');
    
    console.log(`- 精選導師: ${featuredTutors.length} 個`);
    console.log(`- 活躍導師: ${activeTutors.length} 個`);
    console.log(`- 已審核導師: ${approvedTutors.length} 個`);
    
    if (featuredTutors.length > 0) {
      console.log('\n🎉 現在有精選導師了！');
      featuredTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (isTop: ${tutor.isTop}, isVip: ${tutor.isVip})`);
      });
    } else {
      console.log('\n⚠️  仍然沒有精選導師，但 API 會使用 fallback 查詢');
    }
    
  } catch (error) {
    console.error('❌ 修復導師資料時出錯:', error);
  }
};

// 執行修復
const main = async () => {
  await connectDB();
  await fixTutorData();
  await mongoose.connection.close();
  console.log('\n✅ 修復完成');
};

main().catch(console.error); 