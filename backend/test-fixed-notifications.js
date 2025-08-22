const mongoose = require('mongoose');
require('dotenv').config();

// 连接到数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function testFixedNotifications() {
  try {
    console.log('🧪 测试修复后的通知API...\n');

    // 1. 检查所有有 profileChangeLog 的用户
    const usersWithChanges = await User.find({
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    }).select('name email tutorId userId profileChangeLog createdAt');

    console.log(`📊 找到 ${usersWithChanges.length} 个有修改记录的用户`);

    if (usersWithChanges.length === 0) {
      console.log('✅ 数据库中没有修改记录，这是正常的');
      return;
    }

    // 2. 检查每个用户的修改记录时间
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    console.log(`\n⏰ 当前时间: ${now.toLocaleString()}`);
    console.log(`⏰ 24小时前: ${oneDayAgo.toLocaleString()}`);
    
    let totalChanges = 0;
    let recentChanges = 0;
    
    usersWithChanges.forEach((user, index) => {
      console.log(`\n👤 用户 ${index + 1}: ${user.name} (${user.tutorId || user.userId})`);
      console.log(`   修改记录数量: ${user.profileChangeLog.length}`);
      
      user.profileChangeLog.forEach((change, changeIndex) => {
        const changeDate = new Date(change.timestamp);
        const timeAgo = Math.floor((Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
        const isRecent = changeDate > oneDayAgo;
        
        console.log(`   ${changeIndex + 1}. 修改时间: ${changeDate.toLocaleString()} (${timeAgo} 天前) ${isRecent ? '🟢 最近24小时' : '🔴 超过24小时'}`);
        console.log(`      修改字段: ${change.fields.join(', ')}`);
        
        totalChanges++;
        if (isRecent) {
          recentChanges++;
        }
      });
    });

    console.log(`\n📊 总结:`);
    console.log(`   总修改记录: ${totalChanges} 条`);
    console.log(`   24小时内: ${recentChanges} 条`);
    console.log(`   超过24小时: ${totalChanges - recentChanges} 条`);

    // 3. 模拟修复后的 recent-changes API 查询
    console.log('\n🔍 模拟修复后的 recent-changes API 查询...');
    
    const apiResult = await User.aggregate([
      {
        $match: {
          userType: { $in: ['tutor', 'organization'] },
          profileChangeLog: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$profileChangeLog'
      },
      {
        $match: {
          'profileChangeLog.timestamp': { $gte: oneDayAgo }
        }
      },
      {
        $sort: { 'profileChangeLog.timestamp': -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          tutorId: { $ifNull: ['$tutorId', '$userId', { $concat: ['unknown_', { $toString: '$_id' }] }] },
          name: { $ifNull: ['$name', '未知姓名'] },
          email: { $ifNull: ['$email', '未知郵箱'] },
          change: {
            timestamp: '$profileChangeLog.timestamp',
            fields: { $ifNull: ['$profileChangeLog.fields', []] },
            newValues: { $ifNull: ['$profileChangeLog.newValues', {}] },
            oldValues: { $ifNull: ['$profileChangeLog.oldValues', {}] },
            ipAddress: '$profileChangeLog.ipAddress',
            userAgent: '$profileChangeLog.userAgent'
          }
        }
      }
    ]);

    console.log(`📊 修复后的API返回了 ${apiResult.length} 条24小时内的记录`);
    
    if (apiResult.length === 0) {
      console.log('✅ 修复成功: 没有24小时内的修改记录，API返回空数组');
    } else {
      console.log('⚠️  仍有24小时内的修改记录，API正常工作');
      apiResult.forEach((change, index) => {
        const changeDate = new Date(change.change.timestamp);
        const timeAgo = Math.floor((Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ${index + 1}. ${change.name} (${change.tutorId}) - ${timeAgo} 天前`);
      });
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFixedNotifications();
