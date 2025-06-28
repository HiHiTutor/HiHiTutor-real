const mongoose = require('mongoose');
require('dotenv').config();

// 連接 MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
}

// 檢查導師的 isVip 和 isTop 狀態
async function checkFeaturedTutors() {
  try {
    const User = require('../models/User');
    
    console.log('🔍 檢查所有導師的 isVip 和 isTop 狀態...');
    
    const tutors = await User.find({ userType: 'tutor' })
      .select('name email isVip isTop tutorProfile.applicationStatus');
    
    console.log(`📊 找到 ${tutors.length} 個導師`);
    
    let vipCount = 0;
    let topCount = 0;
    let approvedCount = 0;
    
    tutors.forEach(tutor => {
      console.log(`👤 ${tutor.name} (${tutor.email}):`);
      console.log(`   - isVip: ${tutor.isVip || false}`);
      console.log(`   - isTop: ${tutor.isTop || false}`);
      console.log(`   - 申請狀態: ${tutor.tutorProfile?.applicationStatus || 'unknown'}`);
      console.log('');
      
      if (tutor.isVip) vipCount++;
      if (tutor.isTop) topCount++;
      if (tutor.tutorProfile?.applicationStatus === 'approved') approvedCount++;
    });
    
    console.log('📈 統計結果:');
    console.log(`- 總導師數: ${tutors.length}`);
    console.log(`- VIP 導師: ${vipCount}`);
    console.log(`- 置頂導師: ${topCount}`);
    console.log(`- 已批准導師: ${approvedCount}`);
    
    // 檢查符合 featured 條件的導師
    const featuredTutors = tutors.filter(tutor => 
      tutor.isVip || tutor.isTop
    );
    
    console.log(`\n🎯 符合 featured 條件的導師 (isVip=true 或 isTop=true): ${featuredTutors.length}`);
    
    if (featuredTutors.length === 0) {
      console.log('⚠️ 沒有導師符合 featured 條件！');
      console.log('💡 建議：');
      console.log('1. 檢查導師的 isVip 和 isTop 欄位是否正確設置');
      console.log('2. 或者修改查詢條件，使用其他欄位來識別 featured 導師');
    } else {
      featuredTutors.forEach(tutor => {
        console.log(`   - ${tutor.name}: isVip=${tutor.isVip}, isTop=${tutor.isTop}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  }
}

// 主函數
async function main() {
  await connectDB();
  await checkFeaturedTutors();
  await mongoose.disconnect();
  console.log('🔌 已斷開資料庫連接');
}

main(); 