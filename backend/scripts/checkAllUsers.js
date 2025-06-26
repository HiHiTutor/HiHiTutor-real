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

// 檢查所有用戶資料
const checkAllUsers = async () => {
  try {
    const User = require('../models/User');
    
    console.log('\n📊 檢查所有用戶資料');
    console.log('=' .repeat(60));
    
    // 獲取所有用戶
    const allUsers = await User.find({}).lean();
    console.log(`📋 總用戶數量: ${allUsers.length}`);
    
    if (allUsers.length === 0) {
      console.log('❌ 資料庫中沒有任何用戶資料');
      return;
    }
    
    // 按用戶類型分類
    const usersByType = {
      tutor: [],
      student: [],
      organization: []
    };
    
    allUsers.forEach(user => {
      const userType = user.userType || 'unknown';
      if (usersByType[userType]) {
        usersByType[userType].push(user);
      }
    });
    
    console.log('\n📊 用戶分類統計:');
    console.log(`- 導師: ${usersByType.tutor.length} 個`);
    console.log(`- 學生: ${usersByType.student.length} 個`);
    console.log(`- 機構: ${usersByType.organization.length} 個`);
    
    // 顯示所有用戶詳細資訊
    console.log('\n📝 所有用戶詳細資料:');
    console.log('-' .repeat(80));
    
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. 用戶: ${user.name || '未命名'} (ID: ${user._id})`);
      console.log(`   - 用戶類型: ${user.userType || '未設定'}`);
      console.log(`   - UserID: ${user.userId || '未設定'}`);
      console.log(`   - Email: ${user.email || '未設定'}`);
      console.log(`   - 電話: ${user.phone || '未設定'}`);
      console.log(`   - 狀態: ${user.status || '未設定'}`);
      console.log(`   - 活躍: ${user.isActive ? '是' : '否'}`);
      
      if (user.userType === 'tutor') {
        console.log(`   - 精選: ${user.isTop ? '是' : '否'}`);
        console.log(`   - VIP: ${user.isVip ? '是' : '否'}`);
        console.log(`   - 評分: ${user.rating || 0}`);
        console.log(`   - 審核狀態: ${user.profileStatus || '未設定'}`);
      }
    });
    
    // 特別檢查你提到的帳戶
    console.log('\n🔍 特別檢查 - 常山趙子龍 和 才高八斗劉阿斗:');
    console.log('-' .repeat(60));
    
    const targetUsers = allUsers.filter(user => 
      user.name === '常山趙子龍' || user.name === '才高八斗劉阿斗'
    );
    
    if (targetUsers.length === 0) {
      console.log('❌ 沒有找到「常山趙子龍」或「才高八斗劉阿斗」這兩個帳戶');
      console.log('💡 可能原因:');
      console.log('   - 這兩個帳戶在之前的清空操作中被刪除了');
      console.log('   - 這兩個帳戶是學生帳戶，不是導師帳戶');
      console.log('   - 帳戶名稱可能有變化');
    } else {
      targetUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user._id})`);
        console.log(`   - 用戶類型: ${user.userType}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - 狀態: ${user.status}`);
        console.log(`   - 活躍: ${user.isActive ? '是' : '否'}`);
        
        if (user.userType === 'tutor') {
          console.log(`   - 精選: ${user.isTop ? '是' : '否'}`);
          console.log(`   - VIP: ${user.isVip ? '是' : '否'}`);
          console.log(`   - 評分: ${user.rating || 0}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 檢查用戶資料時出錯:', error);
  }
};

// 執行檢查
const main = async () => {
  await connectDB();
  await checkAllUsers();
  await mongoose.connection.close();
  console.log('\n✅ 檢查完成');
};

main().catch(console.error); 