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

// 檢查導師資料
const checkTutorData = async () => {
  try {
    const User = require('../models/User');
    
    console.log('\n📊 分析 /api/tutors?featured=true&limit=8 查詢條件');
    console.log('=' .repeat(60));
    
    // 1. 列出查詢條件
    console.log('\n🔍 當前查詢條件:');
    console.log('- userType: "tutor"');
    console.log('- $or: [{ isTop: true }, { isVip: true }]');
    console.log('- 排序: { rating: -1, createdAt: -1 }');
    console.log('- 限制: 8 個');
    
    // 2. 檢查所有導師資料
    console.log('\n📋 檢查所有 userType="tutor" 的用戶:');
    const allTutors = await User.find({ userType: 'tutor' }).lean();
    console.log(`- 總共找到 ${allTutors.length} 個導師`);
    
    if (allTutors.length === 0) {
      console.log('❌ 數據庫中沒有任何導師資料');
      return;
    }
    
    // 3. 檢查每個導師的詳細資料
    console.log('\n📝 導師詳細資料分析:');
    console.log('-' .repeat(80));
    
    const analysis = {
      totalTutors: allTutors.length,
      featuredTutors: 0,
      missingFields: [],
      nonFeaturedTutors: [],
      activeTutors: 0,
      approvedTutors: 0
    };
    
    allTutors.forEach((tutor, index) => {
      console.log(`\n${index + 1}. 導師: ${tutor.name || '未命名'} (ID: ${tutor._id})`);
      
      // 檢查基本欄位
      const issues = [];
      
      // 檢查 userType
      if (tutor.userType !== 'tutor') {
        issues.push(`userType: ${tutor.userType} (應為 'tutor')`);
      }
      
      // 檢查 isActive
      if (tutor.isActive === false) {
        issues.push(`isActive: ${tutor.isActive} (應為 true)`);
      } else if (tutor.isActive === true) {
        analysis.activeTutors++;
      }
      
      // 檢查 status
      if (tutor.status !== 'active') {
        issues.push(`status: ${tutor.status} (應為 'active')`);
      }
      
      // 檢查 profileStatus
      if (tutor.profileStatus !== 'approved') {
        issues.push(`profileStatus: ${tutor.profileStatus} (應為 'approved')`);
      } else {
        analysis.approvedTutors++;
      }
      
      // 檢查 featured 條件
      const isTop = tutor.isTop === true;
      const isVip = tutor.isVip === true;
      const isFeatured = isTop || isVip;
      
      if (isFeatured) {
        analysis.featuredTutors++;
        console.log(`  ✅ 符合 featured 條件 (isTop: ${isTop}, isVip: ${isVip})`);
      } else {
        analysis.nonFeaturedTutors.push({
          _id: tutor._id,
          name: tutor.name || '未命名',
          isTop: tutor.isTop,
          isVip: tutor.isVip
        });
        console.log(`  ❌ 不符合 featured 條件 (isTop: ${isTop}, isVip: ${isVip})`);
      }
      
      // 檢查其他重要欄位
      if (!tutor.name) {
        issues.push('name: 缺失');
      }
      
      if (!tutor.rating && tutor.rating !== 0) {
        issues.push('rating: 缺失');
      }
      
      if (!tutor.tutorProfile?.subjects || tutor.tutorProfile.subjects.length === 0) {
        issues.push('tutorProfile.subjects: 缺失或為空');
      }
      
      if (issues.length > 0) {
        analysis.missingFields.push({
          _id: tutor._id,
          name: tutor.name || '未命名',
          issues: issues
        });
        console.log(`  ⚠️  問題: ${issues.join(', ')}`);
      } else {
        console.log(`  ✅ 所有必要欄位完整`);
      }
    });
    
    // 4. 總結分析
    console.log('\n📊 分析總結:');
    console.log('=' .repeat(60));
    console.log(`總導師數量: ${analysis.totalTutors}`);
    console.log(`符合 featured 條件的導師: ${analysis.featuredTutors}`);
    console.log(`不符合 featured 條件的導師: ${analysis.nonFeaturedTutors.length}`);
    console.log(`活躍導師 (isActive=true): ${analysis.activeTutors}`);
    console.log(`已審核導師 (profileStatus=approved): ${analysis.approvedTutors}`);
    console.log(`有欄位問題的導師: ${analysis.missingFields.length}`);
    
    // 5. 詳細問題列表
    if (analysis.missingFields.length > 0) {
      console.log('\n⚠️  有欄位問題的導師:');
      analysis.missingFields.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor._id})`);
        tutor.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
    }
    
    if (analysis.nonFeaturedTutors.length > 0) {
      console.log('\n❌ 不符合 featured 條件的導師:');
      analysis.nonFeaturedTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor._id}) - isTop: ${tutor.isTop}, isVip: ${tutor.isVip}`);
      });
    }
    
    // 6. 建議的查詢條件
    console.log('\n💡 建議的查詢條件:');
    console.log('=' .repeat(60));
    
    if (analysis.featuredTutors === 0) {
      console.log('❌ 沒有符合 featured 條件的導師');
      console.log('💡 建議 fallback 查詢條件:');
      console.log('- userType: "tutor"');
      console.log('- isActive: true');
      console.log('- status: "active"');
      console.log('- profileStatus: "approved"');
      console.log('- 排序: { rating: -1, createdAt: -1 }');
      console.log('- 限制: 8 個');
      
      // 測試 fallback 查詢
      const fallbackQuery = {
        userType: 'tutor',
        isActive: true,
        status: 'active',
        profileStatus: 'approved'
      };
      
      const fallbackTutors = await User.find(fallbackQuery)
        .sort({ rating: -1, createdAt: -1 })
        .limit(8)
        .lean();
      
      console.log(`\n🔍 Fallback 查詢結果: ${fallbackTutors.length} 個導師`);
      fallbackTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (評分: ${tutor.rating || 0})`);
      });
    } else {
      console.log('✅ 有符合 featured 條件的導師，當前查詢條件合適');
    }
    
  } catch (error) {
    console.error('❌ 檢查導師資料時出錯:', error);
  }
};

// 執行檢查
const main = async () => {
  await connectDB();
  await checkTutorData();
  await mongoose.connection.close();
  console.log('\n✅ 檢查完成');
};

main().catch(console.error); 