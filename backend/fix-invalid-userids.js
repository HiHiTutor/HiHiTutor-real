const mongoose = require('mongoose');
const User = require('./models/User');

async function fixInvalidUserIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找所有無效的 userId
    const invalidUsers = await User.find({
      $or: [
        { userId: { $regex: /NaN/ } },
        { userId: { $regex: /null/ } },
        { userId: { $regex: /undefined/ } },
        { userId: { $regex: /^0+$/ } } // 全是 0 的 userId
      ]
    });

    console.log(`🔍 Found ${invalidUsers.length} users with invalid userIds`);

    if (invalidUsers.length === 0) {
      console.log('✅ No invalid userIds found');
      return;
    }

    // 獲取最大的有效 userId
    const maxUser = await User.findOne({
      userId: { 
        $exists: true,
        $not: { $regex: /NaN|null|undefined/ },
        $ne: '0000000'
      }
    }).sort({ userId: -1 });

    let nextId = 1000001;
    if (maxUser && maxUser.userId) {
      const parsedId = parseInt(maxUser.userId, 10);
      if (!isNaN(parsedId)) {
        nextId = parsedId + 1;
      }
    }

    console.log(`🔢 Starting to assign userIds from: ${nextId}`);

    // 修復每個無效的 userId
    for (const user of invalidUsers) {
      const newUserId = nextId.toString().padStart(7, '0');
      
      console.log(`🔧 Fixing user: ${user.name} (${user.email})`);
      console.log(`   Old userId: ${user.userId}`);
      console.log(`   New userId: ${newUserId}`);
      
      user.userId = newUserId;
      await user.save();
      
      nextId++;
    }

    console.log('✅ All invalid userIds have been fixed');

    // 驗證修復結果
    const remainingInvalidUsers = await User.find({
      $or: [
        { userId: { $regex: /NaN/ } },
        { userId: { $regex: /null/ } },
        { userId: { $regex: /undefined/ } },
        { userId: { $regex: /^0+$/ } }
      ]
    });

    console.log(`🔍 Remaining invalid userIds: ${remainingInvalidUsers.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixInvalidUserIds(); 