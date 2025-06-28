require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// 生成唯一 2字母+4數字 tutorId
async function generateTutorId() {
  const lastTutor = await User.findOne({ tutorId: { $exists: true } }).sort({ tutorId: -1 });
  let prefix = 'AA';
  let number = 1;
  if (lastTutor && lastTutor.tutorId) {
    prefix = lastTutor.tutorId.slice(0, 2);
    number = parseInt(lastTutor.tutorId.slice(2), 10) + 1;
    if (number > 9999) {
      const firstChar = prefix.charCodeAt(0);
      const secondChar = prefix.charCodeAt(1);
      if (secondChar < 90) { // 'Z'
        prefix = String.fromCharCode(firstChar, secondChar + 1);
      } else if (firstChar < 90) {
        prefix = String.fromCharCode(firstChar + 1, 65); // 65 = 'A'
      } else {
        throw new Error('tutorId 已達上限');
      }
      number = 1;
    }
  }
  return `${prefix}${number.toString().padStart(4, '0')}`;
}

async function fixMissingTutorIds() {
  try {
    console.log('🔍 檢查缺失 tutorId 的導師...');
    
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 資料庫連接成功');
    
    // 找到所有沒有 tutorId 的導師
    const tutorsWithoutTutorId = await User.find({ 
      userType: 'tutor', 
      $or: [
        { tutorId: { $exists: false } },
        { tutorId: null },
        { tutorId: undefined }
      ]
    });
    
    console.log(`📊 找到 ${tutorsWithoutTutorId.length} 個沒有 tutorId 的導師`);
    
    if (tutorsWithoutTutorId.length === 0) {
      console.log('✅ 所有導師都有 tutorId，無需修復');
      return;
    }
    
    // 為每個導師生成 tutorId
    for (const tutor of tutorsWithoutTutorId) {
      const tutorId = await generateTutorId();
      
      console.log(`🎓 為導師 ${tutor.name} (${tutor.email}) 分配 tutorId: ${tutorId}`);
      
      // 更新導師的 tutorId
      await User.findByIdAndUpdate(tutor._id, { 
        tutorId: tutorId,
        profileStatus: 'approved',
        remarks: '系統自動補上 tutorId'
      });
    }
    
    // 檢查修復結果
    const allTutors = await User.find({ userType: 'tutor' });
    console.log('\n✅ 修復完成！所有導師的 tutorId:');
    
    allTutors.forEach(tutor => {
      console.log(`🎓 ${tutor.name} (${tutor.email}) - tutorId: ${tutor.tutorId || '缺失'}`);
    });
    
    // 統計
    const tutorsWithTutorId = await User.countDocuments({ 
      userType: 'tutor', 
      tutorId: { $exists: true, $ne: null } 
    });
    
    console.log(`\n📊 統計結果:`);
    console.log(`- 總導師數: ${allTutors.length}`);
    console.log(`- 有 tutorId 的導師: ${tutorsWithTutorId}`);
    console.log(`- 缺失 tutorId 的導師: ${allTutors.length - tutorsWithTutorId}`);
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 已斷開資料庫連接');
  }
}

fixMissingTutorIds(); 