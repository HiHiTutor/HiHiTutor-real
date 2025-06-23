const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function generateUserId() {
  const lastUser = await User.findOne({}, {}, { sort: { 'userId': -1 } });
  const lastUserId = lastUser?.userId ? parseInt(lastUser.userId) : 1000000;
  return (lastUserId + 1).toString();
}

async function fixTutorUserIds() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');

    // 找到所有沒有 userId 的導師
    const tutorsWithoutUserId = await User.find({ 
      userType: 'tutor', 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: undefined }
      ]
    });

    console.log(`🔍 找到 ${tutorsWithoutUserId.length} 個沒有 userId 的導師`);

    for (const tutor of tutorsWithoutUserId) {
      const newUserId = await generateUserId();
      
      console.log(`📝 為導師 ${tutor.name} (${tutor.email}) 分配 userId: ${newUserId}`);
      
      // 更新導師的 userId
      await User.findByIdAndUpdate(tutor._id, { userId: newUserId });
    }

    // 檢查修復結果
    const allTutors = await User.find({ userType: 'tutor' });
    console.log('\n✅ 修復完成！所有導師的 userId:');
    
    allTutors.forEach(tutor => {
      console.log(`🎓 ${tutor.name} (${tutor.email}) - userId: ${tutor.userId}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  fixTutorUserIds();
}

module.exports = { fixTutorUserIds }; 