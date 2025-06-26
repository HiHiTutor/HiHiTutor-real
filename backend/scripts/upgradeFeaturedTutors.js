const mongoose = require('mongoose');
require('dotenv').config();

// 連接資料庫
const connectDB = async () => {
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
};

// 用戶模型
const userSchema = new mongoose.Schema({
  userID: String,
  name: String,
  email: String,
  phone: String,
  password: String,
  userType: String,
  isActive: Boolean,
  status: String,
  isTop: Boolean,
  isVip: Boolean,
  tutorProfile: {
    profileStatus: String,
    subjects: [String],
    education: String,
    experience: String,
    rating: Number,
    avatarUrl: String
  },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

(async () => {
  try {
    await connectDB();

    // 查找符合條件的導師（放寬條件）
    const tutors = await User.find({
      userType: 'tutor',
      isActive: true,
      status: 'active',
    });

    console.log(`📊 找到 ${tutors.length} 位符合條件的導師`);

    if (tutors.length === 0) {
      console.log('⚠️ 沒有找到符合條件的導師');
      process.exit(0);
    }

    // 選擇前 5 位導師
    const featuredTutors = tutors.slice(0, 5);
    
    console.log(`🎯 準備升級 ${featuredTutors.length} 位導師為 featured:`);
    featuredTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.userID || '無ID'})`);
    });

    // 升級導師
    for (const tutor of featuredTutors) {
      tutor.isTop = true;
      await tutor.save();
      console.log(`✅ 導師 ${tutor.name} (${tutor.userID || '無ID'}) 已升級為 featured`);
    }

    console.log(`🎉 共升級 ${featuredTutors.length} 位導師為 featured`);
    
    // 驗證結果
    const featuredCount = await User.countDocuments({ isTop: true });
    console.log(`📈 目前資料庫中共有 ${featuredCount} 位 featured 導師`);

  } catch (error) {
    console.error('❌ 執行腳本時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
    process.exit(0);
  }
})(); 