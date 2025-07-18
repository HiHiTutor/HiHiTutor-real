const mongoose = require('mongoose');
const User = require('../models/User');

// 連接數據庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 檢查導師數據
const checkTutorData = async () => {
  try {
    console.log('🔍 檢查導師數據結構...');
    
    // 首先檢查所有用戶
    const allUsers = await User.find({});
    console.log(`📊 數據庫中總共有 ${allUsers.length} 個用戶`);
    
    // 按userType分類
    const userTypes = {};
    allUsers.forEach(user => {
      const type = user.userType || 'unknown';
      userTypes[type] = (userTypes[type] || 0) + 1;
    });
    
    console.log('📋 用戶類型分布:');
    Object.entries(userTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 個`);
    });
    
    // 獲取所有導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`\n📊 找到 ${tutors.length} 位導師`);
    
    if (tutors.length === 0) {
      console.log('❌ 沒有找到任何導師數據');
      
      // 檢查individual用戶是否有導師相關資料
      console.log('\n🔍 檢查individual用戶是否有導師相關資料...');
      const individualUsers = await User.find({ userType: 'individual' });
      console.log(`📊 找到 ${individualUsers.length} 個individual用戶`);
      
      for (const user of individualUsers.slice(0, 3)) { // 只檢查前3個
        console.log(`\n👤 用戶: ${user.name} (${user.userId})`);
        console.log(`   userType: ${user.userType}`);
        
        // 檢查是否有tutorProfile
        if (user.tutorProfile) {
          console.log(`   ✅ 有tutorProfile`);
          console.log(`   tutorProfile結構:`, Object.keys(user.tutorProfile));
          
          // 檢查是否有subjects
          if (user.tutorProfile.subjects) {
            console.log(`   ✅ 有subjects: ${user.tutorProfile.subjects.join(', ')}`);
          } else {
            console.log(`   ❌ 沒有subjects`);
          }
        } else {
          console.log(`   ❌ 沒有tutorProfile`);
        }
        
        // 檢查整個文檔結構
        const docKeys = Object.keys(user.toObject());
        console.log(`   📋 完整文檔結構 (${docKeys.length} 個欄位):`, docKeys);
      }
      
      if (individualUsers.length > 3) {
        console.log(`\n... 還有 ${individualUsers.length - 3} 個用戶未顯示`);
      }
    }
    
  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  await checkTutorData();
  await mongoose.disconnect();
  console.log('✅ 數據庫連接已關閉');
};

// 執行腳本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkTutorData }; 