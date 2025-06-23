const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testGetTutorById() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');

    const testId = '1000002';
    console.log('🔍 測試查找導師:', testId);
    
    // 測試多種方式查找導師
    let tutor = null;
    
    // 1. 先嘗試用 userId 查找
    console.log('1️⃣ 嘗試用 userId 查找...');
    tutor = await User.findOne({ 
      userId: testId,
      userType: 'tutor',
      isActive: true 
    }).select('-password -refreshToken');
    
    if (tutor) {
      console.log('✅ 用 userId 找到導師:', tutor.name);
    } else {
      console.log('❌ 用 userId 找不到導師');
    }
    
    // 2. 如果找不到，嘗試用 MongoDB _id 查找
    if (!tutor && testId.length === 24) {
      console.log('2️⃣ 嘗試用 MongoDB _id 查找...');
      tutor = await User.findOne({ 
        _id: testId,
        userType: 'tutor',
        isActive: true 
      }).select('-password -refreshToken');
      
      if (tutor) {
        console.log('✅ 用 MongoDB _id 找到導師:', tutor.name);
      } else {
        console.log('❌ 用 MongoDB _id 找不到導師');
      }
    }
    
    // 3. 如果還是找不到，嘗試用 tutorId 查找
    if (!tutor) {
      console.log('3️⃣ 嘗試用 tutorId 查找...');
      tutor = await User.findOne({ 
        tutorId: testId,
        userType: 'tutor',
        isActive: true 
      }).select('-password -refreshToken');
      
      if (tutor) {
        console.log('✅ 用 tutorId 找到導師:', tutor.name);
      } else {
        console.log('❌ 用 tutorId 找不到導師');
      }
    }
    
    if (!tutor) {
      console.log('❌ 所有方法都找不到導師');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name);
    console.log('📋 導師資料:');
    console.log(`   _id: ${tutor._id}`);
    console.log(`   userId: ${tutor.userId}`);
    console.log(`   tutorId: ${tutor.tutorId}`);
    console.log(`   name: ${tutor.name}`);
    console.log(`   userType: ${tutor.userType}`);
    console.log(`   isActive: ${tutor.isActive}`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  testGetTutorById();
}

module.exports = { testGetTutorById }; 