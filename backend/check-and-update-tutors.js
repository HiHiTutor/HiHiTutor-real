const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAndUpdateTutors() {
  try {
    // 檢查環境變數
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 環境變數未設定');
      return;
    }
    
    console.log('🔄 連接資料庫...');
    
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ 資料庫連接成功');
    
    // 檢查所有 tutor
    const allTutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總共有 ${allTutors.length} 個 tutor`);
    
    // 檢查現有狀態
    const vipTutors = allTutors.filter(t => t.isVip);
    const topTutors = allTutors.filter(t => t.isTop);
    const regularTutors = allTutors.filter(t => !t.isVip && !t.isTop);
    
    console.log(`📈 現有狀態:`);
    console.log(`- VIP tutors: ${vipTutors.length}`);
    console.log(`- Top tutors: ${topTutors.length}`);
    console.log(`- Regular tutors: ${regularTutors.length}`);
    
    // 如果無 VIP 或 Top tutor，將前幾個設為 VIP 和 Top
    if (vipTutors.length === 0 && topTutors.length === 0) {
      console.log('🔄 無 VIP 或 Top tutor，開始設定...');
      
      // 將前 3 個設為 VIP
      for (let i = 0; i < Math.min(3, allTutors.length); i++) {
        await User.findByIdAndUpdate(allTutors[i]._id, { isVip: true });
        console.log(`✅ 設 ${allTutors[i].name} 為 VIP`);
      }
      
      // 將接下來 5 個設為 Top
      for (let i = 3; i < Math.min(8, allTutors.length); i++) {
        await User.findByIdAndUpdate(allTutors[i]._id, { isTop: true });
        console.log(`✅ 設 ${allTutors[i].name} 為 Top`);
      }
      
      console.log('🎉 設定完成！');
    } else {
      console.log('ℹ️ 已有 VIP 或 Top tutor，無需修改');
    }
    
    // 重新檢查狀態
    const updatedTutors = await User.find({ userType: 'tutor' });
    const updatedVipTutors = updatedTutors.filter(t => t.isVip);
    const updatedTopTutors = updatedTutors.filter(t => t.isTop);
    
    console.log(`📈 更新後狀態:`);
    console.log(`- VIP tutors: ${updatedVipTutors.length}`);
    console.log(`- Top tutors: ${updatedTopTutors.length}`);
    
    // 顯示 VIP 和 Top tutor 名單
    if (updatedVipTutors.length > 0) {
      console.log('👑 VIP Tutors:');
      updatedVipTutors.forEach(t => console.log(`  - ${t.name}`));
    }
    
    if (updatedTopTutors.length > 0) {
      console.log('⭐ Top Tutors:');
      updatedTopTutors.forEach(t => console.log(`  - ${t.name}`));
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
  }
}

checkAndUpdateTutors(); 