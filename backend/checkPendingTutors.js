const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkPendingTutors() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 檢查所有導師
    const allTutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總導師數量: ${allTutors.length}`);

    // 檢查待審核的導師
    const pendingTutors = await User.find({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    });
    console.log(`⏳ 待審核導師數量: ${pendingTutors.length}`);

    if (pendingTutors.length > 0) {
      console.log('\n📋 待審核導師列表:');
      pendingTutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.email}) - 狀態: ${tutor.profileStatus}`);
      });
    } else {
      console.log('\n✅ 目前沒有待審核的導師資料');
    }

    // 檢查所有導師的狀態分布
    const statusCounts = await User.aggregate([
      { $match: { userType: 'tutor' } },
      { $group: { _id: '$profileStatus', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 導師狀態分布:');
    statusCounts.forEach(status => {
      console.log(`- ${status._id || '未設置'}: ${status.count} 人`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

checkPendingTutors(); 