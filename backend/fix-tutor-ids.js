const mongoose = require('mongoose');
const User = require('./models/User');

// 載入環境變數
require('dotenv').config();

// 連接到 MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      bufferCommands: true
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 生成唯一的 tutorId
const generateTutorId = async () => {
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
};

// 修復導師的 tutorId
const fixTutorIds = async () => {
  try {
    console.log('🔍 開始修復導師 tutorId...');
    
    // 查找所有沒有 tutorId 的導師
    const tutorsWithoutTutorId = await User.find({
      userType: 'tutor',
      tutorId: { $exists: false }
    });
    
    console.log(`📊 找到 ${tutorsWithoutTutorId.length} 個沒有 tutorId 的導師`);
    
    if (tutorsWithoutTutorId.length === 0) {
      console.log('✅ 所有導師都已經有 tutorId');
      return;
    }
    
    // 為每個導師生成 tutorId
    for (let i = 0; i < tutorsWithoutTutorId.length; i++) {
      const tutor = tutorsWithoutTutorId[i];
      const tutorId = await generateTutorId();
      
      console.log(`🔧 修復導師 ${i + 1}/${tutorsWithoutTutorId.length}: ${tutor.name}`);
      console.log(`   - 原 ID: ${tutor._id}`);
      console.log(`   - 新 TutorId: ${tutorId}`);
      
      // 更新導師記錄
      await User.findByIdAndUpdate(tutor._id, {
        $set: { tutorId: tutorId }
      });
      
      console.log(`   ✅ 更新成功`);
    }
    
    console.log('🎉 所有導師的 tutorId 修復完成！');
    
    // 驗證修復結果
    const allTutors = await User.find({ userType: 'tutor' });
    const tutorsWithTutorId = allTutors.filter(t => t.tutorId);
    
    console.log(`\n📊 修復後統計:`);
    console.log(`- 總導師數: ${allTutors.length}`);
    console.log(`- 有 tutorId 的導師: ${tutorsWithTutorId.length}`);
    console.log(`- 缺少 tutorId 的導師: ${allTutors.length - tutorsWithTutorId.length}`);
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  await fixTutorIds();
  await mongoose.disconnect();
  console.log('✅ 腳本執行完成');
};

main(); 