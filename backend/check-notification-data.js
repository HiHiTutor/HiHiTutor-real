const mongoose = require('mongoose');
require('dotenv').config();

// 连接到数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function checkNotificationData() {
  try {
    console.log('🔍 检查通知系统中的数据...\n');

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

    // 2. 检查每个用户的修改记录
    usersWithChanges.forEach((user, index) => {
      console.log(`\n👤 用户 ${index + 1}: ${user.name} (${user.tutorId || user.userId})`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   修改记录数量: ${user.profileChangeLog.length}`);
      
      // 显示最近的5个修改记录
      const recentChanges = user.profileChangeLog
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      
      recentChanges.forEach((change, changeIndex) => {
        const changeDate = new Date(change.timestamp);
        const timeAgo = Math.floor((Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ${changeIndex + 1}. 修改时间: ${changeDate.toLocaleString()} (${timeAgo} 天前)`);
        console.log(`      修改字段: ${change.fields.join(', ')}`);
        if (change.ipAddress) {
          console.log(`      IP地址: ${change.ipAddress}`);
        }
      });
    });

    // 3. 检查最近的修改记录（模拟 recent-changes API）
    console.log('\n🔍 模拟 recent-changes API 查询...');
    
    const recentChanges = await User.aggregate([
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

    console.log(`📊 API 返回了 ${recentChanges.length} 条记录`);
    
    // 4. 检查24小时内的修改记录
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let recentChangesCount = 0;
    usersWithChanges.forEach(user => {
      user.profileChangeLog.forEach(change => {
        if (new Date(change.timestamp) > oneDayAgo) {
          recentChangesCount++;
        }
      });
    });

    console.log(`\n⏰ 最近24小时内的修改记录: ${recentChangesCount} 条`);
    
    if (recentChangesCount === 0) {
      console.log('⚠️  问题发现: 没有24小时内的修改记录，但API仍然返回数据');
      console.log('💡 建议: 修改API逻辑，只返回24小时内的记录');
    } else {
      console.log('✅ 有最近的修改记录，通知系统工作正常');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkNotificationData();
