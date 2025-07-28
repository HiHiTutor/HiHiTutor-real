const mongoose = require('mongoose');
const User = require('./models/User');

async function testPendingRequests() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 檢查所有導師
    const allTutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總導師數量: ${allTutors.length}`);

    // 檢查有pendingProfile的導師
    const tutorsWithPendingProfile = await User.find({ 
      userType: 'tutor',
      pendingProfile: { $exists: true, $ne: null }
    });
    console.log(`📋 有待審批資料的導師數量: ${tutorsWithPendingProfile.length}`);

    // 檢查pending狀態的申請
    const pendingRequests = await User.find({ 
      userType: 'tutor',
      'pendingProfile.status': 'pending'
    });
    console.log(`⏳ 待審批申請數量: ${pendingRequests.length}`);

    if (pendingRequests.length > 0) {
      console.log('\n📋 待審批申請列表:');
      pendingRequests.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.email})`);
        console.log(`   - pendingProfile.status: ${tutor.pendingProfile.status}`);
        console.log(`   - pendingProfile.submittedAt: ${tutor.pendingProfile.submittedAt}`);
        console.log(`   - pendingProfile.name: ${tutor.pendingProfile.name}`);
        console.log(`   - profileStatus: ${tutor.profileStatus}`);
      });
    } else {
      console.log('\n❌ 沒有找到待審批的申請');
    }

    // 檢查所有導師的pendingProfile狀態分布
    const statusCounts = await User.aggregate([
      { $match: { userType: 'tutor' } },
      { $group: { 
        _id: '$pendingProfile.status', 
        count: { $sum: 1 },
        names: { $push: '$name' }
      }}
    ]);
    
    console.log('\n📈 pendingProfile狀態分布:');
    statusCounts.forEach(status => {
      console.log(`- ${status._id || 'null'}: ${status.count} 人`);
      if (status.names && status.names.length > 0) {
        console.log(`  用戶: ${status.names.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testPendingRequests(); 