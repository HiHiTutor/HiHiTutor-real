const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * 生成標準化的 UserID (7位數字格式)
 * 格式：1000001, 1000002, 1000003...
 */
async function generateStandardUserId() {
  const lastUser = await User.findOne({
    userId: { 
      $exists: true,
      $regex: /^\d{7}$/ // 只匹配7位數字格式
    }
  }).sort({ userId: -1 });
  
  let nextId = 1000001; // 默認起始值
  
  if (lastUser && lastUser.userId) {
    const parsedId = parseInt(lastUser.userId, 10);
    if (!isNaN(parsedId) && parsedId >= 1000001) {
      nextId = parsedId + 1;
    }
  }
  
  return nextId.toString().padStart(7, '0');
}

/**
 * 生成標準化的 TutorID (TU + 4位數字格式)
 * 格式：TU0001, TU0002, TU0003...
 */
async function generateStandardTutorId() {
  const lastTutor = await User.findOne({
    tutorId: { 
      $exists: true,
      $regex: /^TU\d{4}$/ // 只匹配TU + 4位數字格式
    }
  }).sort({ tutorId: -1 });
  
  let nextNumber = 1;
  
  if (lastTutor && lastTutor.tutorId) {
    const number = parseInt(lastTutor.tutorId.slice(2), 10);
    if (!isNaN(number)) {
      nextNumber = number + 1;
    }
  }
  
  return `TU${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * 檢查ID是否符合標準格式
 */
function isValidUserId(userId) {
  return userId && /^\d{7}$/.test(userId);
}

function isValidTutorId(tutorId) {
  return tutorId && /^TU\d{4}$/.test(tutorId);
}

/**
 * 統一所有用戶的ID格式
 */
async function standardizeUserIds() {
  try {
    console.log('🔗 連接到 MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 成功連接到 MongoDB');

    // 獲取所有用戶
    const allUsers = await User.find({});
    console.log(`📊 總共有 ${allUsers.length} 個用戶`);

    // 統計現有ID格式
    let validUserIds = 0;
    let invalidUserIds = 0;
    let validTutorIds = 0;
    let invalidTutorIds = 0;
    let tutorsWithoutTutorId = 0;

    allUsers.forEach(user => {
      if (isValidUserId(user.userId)) {
        validUserIds++;
      } else {
        invalidUserIds++;
      }

      if (user.userType === 'tutor') {
        if (isValidTutorId(user.tutorId)) {
          validTutorIds++;
        } else if (!user.tutorId) {
          tutorsWithoutTutorId++;
        } else {
          invalidTutorIds++;
        }
      }
    });

    console.log('\n📋 現有ID格式統計:');
    console.log(`- 有效 UserID: ${validUserIds}`);
    console.log(`- 無效 UserID: ${invalidUserIds}`);
    console.log(`- 有效 TutorID: ${validTutorIds}`);
    console.log(`- 無效 TutorID: ${invalidTutorIds}`);
    console.log(`- 導師無 TutorID: ${tutorsWithoutTutorId}`);

    // 收集所有現有的有效ID，避免重複
    const existingUserIds = new Set();
    const existingTutorIds = new Set();

    allUsers.forEach(user => {
      if (isValidUserId(user.userId)) {
        existingUserIds.add(user.userId);
      }
      if (isValidTutorId(user.tutorId)) {
        existingTutorIds.add(user.tutorId);
      }
    });

    console.log(`\n📊 現有有效ID數量:`);
    console.log(`- 有效 UserID: ${existingUserIds.size}`);
    console.log(`- 有效 TutorID: ${existingTutorIds.size}`);

    // 開始標準化
    console.log('\n🔄 開始標準化用戶ID...');
    
    let nextUserId = await generateStandardUserId();
    let nextTutorId = await generateStandardTutorId();
    
    let updatedUsers = 0;
    let updatedTutors = 0;
    let errors = 0;

    for (const user of allUsers) {
      try {
        let userUpdated = false;
        let tutorUpdated = false;
        const updateData = {};

        // 標準化 UserID
        if (!isValidUserId(user.userId)) {
          // 生成新的UserID，確保不重複
          while (existingUserIds.has(nextUserId)) {
            const num = parseInt(nextUserId, 10) + 1;
            nextUserId = num.toString().padStart(7, '0');
          }
          
          const oldUserId = user.userId;
          updateData.userId = nextUserId;
          existingUserIds.add(nextUserId);
          
          const num = parseInt(nextUserId, 10) + 1;
          nextUserId = num.toString().padStart(7, '0');
          
          userUpdated = true;
          console.log(`🆔 用戶 ${user.name} (${user.email}): ${oldUserId || '無'} → ${updateData.userId}`);
        }

        // 標準化 TutorID (只處理導師)
        if (user.userType === 'tutor') {
          if (!isValidTutorId(user.tutorId)) {
            // 生成新的TutorID，確保不重複
            while (existingTutorIds.has(nextTutorId)) {
              const num = parseInt(nextTutorId.slice(2), 10) + 1;
              nextTutorId = `TU${num.toString().padStart(4, '0')}`;
            }
            
            const oldTutorId = user.tutorId;
            updateData.tutorId = nextTutorId;
            existingTutorIds.add(nextTutorId);
            
            const num = parseInt(nextTutorId.slice(2), 10) + 1;
            nextTutorId = `TU${num.toString().padStart(4, '0')}`;
            
            tutorUpdated = true;
            console.log(`🎓 導師 ${user.name} (${user.email}): ${oldTutorId || '無'} → ${updateData.tutorId}`);
          }
        }

        // 使用 updateOne 只更新ID字段，避免觸發其他驗證
        if (userUpdated || tutorUpdated) {
          await User.updateOne(
            { _id: user._id },
            { $set: updateData },
            { runValidators: false } // 關閉驗證器
          );
          
          if (userUpdated) updatedUsers++;
          if (tutorUpdated) updatedTutors++;
        }
      } catch (error) {
        errors++;
        console.error(`❌ 更新用戶 ${user.name} (${user.email}) 時發生錯誤:`, error.message);
      }
    }

    console.log('\n✅ 標準化完成！');
    console.log(`📊 更新統計:`);
    console.log(`- 更新用戶數: ${updatedUsers}`);
    console.log(`- 更新導師數: ${updatedTutors}`);
    console.log(`- 錯誤數: ${errors}`);

    // 驗證結果
    console.log('\n🔍 驗證標準化結果...');
    const finalUsers = await User.find({});
    
    let finalValidUserIds = 0;
    let finalValidTutorIds = 0;
    let finalTutorsWithoutTutorId = 0;

    finalUsers.forEach(user => {
      if (isValidUserId(user.userId)) {
        finalValidUserIds++;
      }
      if (user.userType === 'tutor') {
        if (isValidTutorId(user.tutorId)) {
          finalValidTutorIds++;
        } else if (!user.tutorId) {
          finalTutorsWithoutTutorId++;
        }
      }
    });

    console.log(`\n📋 最終結果:`);
    console.log(`- 有效 UserID: ${finalValidUserIds}/${finalUsers.length}`);
    console.log(`- 有效 TutorID: ${finalValidTutorIds}/${finalUsers.filter(u => u.userType === 'tutor').length}`);
    console.log(`- 導師無 TutorID: ${finalTutorsWithoutTutorId}`);

    // 顯示一些示例
    console.log('\n📋 標準化後的用戶示例:');
    const sampleUsers = finalUsers.slice(0, 5);
    sampleUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   - UserID: ${user.userId}`);
      console.log(`   - UserType: ${user.userType}`);
      if (user.userType === 'tutor') {
        console.log(`   - TutorID: ${user.tutorId || '無'}`);
      }
    });

    console.log('\n🎉 所有用戶ID已成功標準化！');

  } catch (error) {
    console.error('❌ 標準化過程中發生錯誤:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  standardizeUserIds()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  standardizeUserIds,
  generateStandardUserId,
  generateStandardTutorId,
  isValidUserId,
  isValidTutorId
}; 