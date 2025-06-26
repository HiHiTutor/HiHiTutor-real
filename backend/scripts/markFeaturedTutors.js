const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

// 連接 MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

async function markFeaturedTutors() {
  // 1. 找出所有符合基本條件但未 featured 的導師
  const eligibleTutors = await User.find({
    userType: 'tutor',
    isActive: true,
    status: 'active',
    isTop: { $ne: true },
    isVip: { $ne: true },
    profileStatus: 'approved'
  });

  // 2. 隨機選最多 3 位導師作為 featured
  const selectedTutors = eligibleTutors.sort(() => 0.5 - Math.random()).slice(0, 3);

  // 3. 更新資料庫，將這幾位導師設為 isTop: true
  for (const tutor of selectedTutors) {
    await User.updateOne({ _id: tutor._id }, { $set: { isTop: true } });
    console.log(`✅ 導師 ${tutor.name} (${tutor.email}) 已設為 featured`);
  }

  if (selectedTutors.length === 0) {
    console.log('⚠️ 沒有符合條件的導師可設為 featured');
  } else {
    console.log(`🎉 已成功設定 ${selectedTutors.length} 位 featured 導師`);
  }
}

// 主程式
const main = async () => {
  await connectDB();
  await markFeaturedTutors();
  await mongoose.connection.close();
  console.log('✅ 完成');
};

main().catch(console.error); 