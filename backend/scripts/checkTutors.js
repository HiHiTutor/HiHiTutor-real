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

    // 檢查所有用戶
    const allUsers = await User.find({});
    console.log(`📊 資料庫中共有 ${allUsers.length} 個用戶`);

    // 檢查導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`👨‍🏫 導師數量: ${tutors.length}`);

    if (tutors.length > 0) {
      console.log('\n📋 導師列表:');
      tutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.userID})`);
        console.log(`   - userType: ${tutor.userType}`);
        console.log(`   - isActive: ${tutor.isActive}`);
        console.log(`   - status: ${tutor.status}`);
        console.log(`   - isTop: ${tutor.isTop}`);
        console.log(`   - isVip: ${tutor.isVip}`);
        console.log(`   - tutorProfile.profileStatus: ${tutor.tutorProfile?.profileStatus}`);
        console.log('');
      });
    }

    // 檢查符合條件的導師
    const eligibleTutors = await User.find({
      userType: 'tutor',
      isActive: true,
      status: 'active',
      'tutorProfile.profileStatus': 'approved',
    });

    console.log(`✅ 符合條件的導師數量: ${eligibleTutors.length}`);

    if (eligibleTutors.length > 0) {
      console.log('\n🎯 符合條件的導師:');
      eligibleTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.userID})`);
      });
    }

  } catch (error) {
    console.error('❌ 執行腳本時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
    process.exit(0);
  }
})(); 