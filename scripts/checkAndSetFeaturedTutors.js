const mongoose = require('mongoose');

// 檢查環境變數
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI 環境變數未設定');
  process.exit(1);
}

// 用戶模型
const userSchema = new mongoose.Schema({
  userID: String,
  tutorId: String,
  name: String,
  email: String,
  phone: String,
  password: String,
  userType: String,
  isActive: Boolean,
  status: String,
  isTop: Boolean,
  isVip: Boolean,
  rating: Number,
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

async function checkAndSetFeaturedTutors() {
  try {
    console.log('🔄 連接資料庫...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 資料庫連接成功');

    // 檢查所有導師
    const allTutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總共有 ${allTutors.length} 個導師`);

    // 檢查現有狀態
    const vipTutors = allTutors.filter(t => t.isVip === true);
    const topTutors = allTutors.filter(t => t.isTop === true);
    const regularTutors = allTutors.filter(t => !t.isVip && !t.isTop);

    console.log(`📈 現有狀態:`);
    console.log(`- VIP 導師: ${vipTutors.length}`);
    console.log(`- 置頂導師: ${topTutors.length}`);
    console.log(`- 普通導師: ${regularTutors.length}`);

    // 顯示所有導師的詳細狀態
    console.log('\n📋 所有導師詳細狀態:');
    allTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name || '未命名'} (${tutor.tutorId || tutor.userID || '無ID'})`);
      console.log(`   - isVip: ${tutor.isVip || false}`);
      console.log(`   - isTop: ${tutor.isTop || false}`);
      console.log(`   - isActive: ${tutor.isActive}`);
      console.log(`   - status: ${tutor.status}`);
      console.log(`   - rating: ${tutor.rating || 0}`);
      console.log('');
    });

    // 如果沒有VIP或置頂導師，設置一些
    if (vipTutors.length === 0 && topTutors.length === 0) {
      console.log('🔄 沒有VIP或置頂導師，開始設置...');
      
      // 按評分排序，選擇評分最高的導師
      const sortedTutors = allTutors
        .filter(t => t.isActive !== false && t.status === 'active')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      if (sortedTutors.length === 0) {
        console.log('⚠️ 沒有符合條件的導師可設置');
        return;
      }

      // 設置前3個為VIP
      for (let i = 0; i < Math.min(3, sortedTutors.length); i++) {
        await User.findByIdAndUpdate(sortedTutors[i]._id, { isVip: true });
        console.log(`✅ 設置 ${sortedTutors[i].name} (${sortedTutors[i].tutorId || sortedTutors[i].userID}) 為 VIP`);
      }

      // 設置接下來5個為置頂
      for (let i = 3; i < Math.min(8, sortedTutors.length); i++) {
        await User.findByIdAndUpdate(sortedTutors[i]._id, { isTop: true });
        console.log(`✅ 設置 ${sortedTutors[i].name} (${sortedTutors[i].tutorId || sortedTutors[i].userID}) 為置頂`);
      }

      console.log('🎉 設置完成！');
    } else {
      console.log('ℹ️ 已有VIP或置頂導師，無需修改');
    }

    // 重新檢查狀態
    const updatedTutors = await User.find({ userType: 'tutor' });
    const updatedVipTutors = updatedTutors.filter(t => t.isVip === true);
    const updatedTopTutors = updatedTutors.filter(t => t.isTop === true);

    console.log('\n📊 更新後的狀態:');
    console.log(`- VIP 導師: ${updatedVipTutors.length}`);
    console.log(`- 置頂導師: ${updatedTopTutors.length}`);

    if (updatedVipTutors.length > 0) {
      console.log('\n👑 VIP 導師列表:');
      updatedVipTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.tutorId || tutor.userID}) - 評分: ${tutor.rating || 0}`);
      });
    }

    if (updatedTopTutors.length > 0) {
      console.log('\n⭐ 置頂導師列表:');
      updatedTopTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.tutorId || tutor.userID}) - 評分: ${tutor.rating || 0}`);
      });
    }

  } catch (error) {
    console.error('❌ 執行腳本時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
  }
}

// 執行腳本
checkAndSetFeaturedTutors(); 