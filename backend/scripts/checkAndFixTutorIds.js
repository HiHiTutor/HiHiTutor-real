const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error.message);
    process.exit(1);
  }
}

// 檢查和修復 tutorId
async function checkAndFixTutorIds() {
  try {
    console.log('🔍 檢查導師 tutorId 情況...');
    
    const User = require('../models/User');
    
    // 查找所有導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`📊 找到 ${tutors.length} 個導師`);
    
    let missingTutorIds = 0;
    let fixedTutorIds = 0;
    
    for (const tutor of tutors) {
      console.log(`\n👤 檢查導師: ${tutor.name}`);
      console.log(`   - 當前 tutorId: ${tutor.tutorId || '❌ 缺少'}`);
      console.log(`   - userId: ${tutor.userId}`);
      console.log(`   - _id: ${tutor._id}`);
      
      if (!tutor.tutorId) {
        missingTutorIds++;
        
        // 生成新的 tutorId
        const newTutorId = `T${String(tutor.userId).padStart(6, '0')}`;
        console.log(`   🔧 生成新 tutorId: ${newTutorId}`);
        
        // 更新數據庫
        await User.findByIdAndUpdate(tutor._id, { 
          tutorId: newTutorId,
          remarks: tutor.remarks ? `${tutor.remarks}; 系統自動補上 tutorId` : '系統自動補上 tutorId'
        });
        
        console.log(`   ✅ 已更新 tutorId 為: ${newTutorId}`);
        fixedTutorIds++;
      } else {
        console.log(`   ✅ tutorId 已存在: ${tutor.tutorId}`);
      }
    }
    
    console.log(`\n📊 檢查結果:`);
    console.log(`   - 總導師數: ${tutors.length}`);
    console.log(`   - 缺少 tutorId: ${missingTutorIds}`);
    console.log(`   - 已修復: ${fixedTutorIds}`);
    
    if (fixedTutorIds > 0) {
      console.log(`\n🎉 成功修復 ${fixedTutorIds} 個導師的 tutorId`);
    } else {
      console.log(`\n✅ 所有導師都已有 tutorId`);
    }
    
  } catch (error) {
    console.error('❌ 檢查和修復 tutorId 時出錯:', error);
  }
}

// 主函數
async function main() {
  await connectDB();
  await checkAndFixTutorIds();
  
  console.log('\n🏁 腳本執行完成');
  process.exit(0);
}

main(); 