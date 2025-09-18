const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * 修復數據庫中重複的 tutorId 問題
 * 這個腳本會：
 * 1. 查找所有重複的 tutorId
 * 2. 為重複的 tutorId 生成新的唯一值
 * 3. 清理 null 值的 tutorId 衝突
 */
async function fixTutorIdDuplicates() {
  try {
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');

    // 1. 查找所有有 tutorId 的用戶
    const usersWithTutorId = await User.find({
      tutorId: { $exists: true, $ne: null }
    }).select('_id name email tutorId userType');

    console.log(`📊 找到 ${usersWithTutorId.length} 個有 tutorId 的用戶`);

    // 2. 統計 tutorId 重複情況
    const tutorIdCounts = {};
    usersWithTutorId.forEach(user => {
      if (user.tutorId) {
        tutorIdCounts[user.tutorId] = (tutorIdCounts[user.tutorId] || 0) + 1;
      }
    });

    // 3. 找出重複的 tutorId
    const duplicateTutorIds = Object.entries(tutorIdCounts)
      .filter(([tutorId, count]) => count > 1)
      .map(([tutorId, count]) => ({ tutorId, count }));

    console.log(`🔍 找到 ${duplicateTutorIds.length} 個重複的 tutorId:`);
    duplicateTutorIds.forEach(({ tutorId, count }) => {
      console.log(`  - ${tutorId}: ${count} 個用戶`);
    });

    if (duplicateTutorIds.length === 0) {
      console.log('✅ 沒有發現重複的 tutorId');
      return;
    }

    // 4. 修復重複的 tutorId
    let fixedCount = 0;
    const errors = [];

    for (const { tutorId } of duplicateTutorIds) {
      // 找到所有使用這個 tutorId 的用戶
      const usersWithSameTutorId = await User.find({ tutorId });
      
      // 保留第一個用戶的 tutorId，為其他用戶生成新的
      for (let i = 1; i < usersWithSameTutorId.length; i++) {
        const user = usersWithSameTutorId[i];
        
        try {
          // 生成新的唯一 tutorId
          let newTutorId;
          let attempts = 0;
          const maxAttempts = 100;
          
          do {
            attempts++;
            const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
            newTutorId = `TU${randomNum}`;
            
            // 檢查是否已存在
            const exists = await User.exists({ tutorId: newTutorId });
            if (!exists) break;
            
            if (attempts >= maxAttempts) {
              throw new Error(`無法生成唯一的 tutorId，已嘗試 ${maxAttempts} 次`);
            }
          } while (true);

          // 更新用戶的 tutorId
          await User.findByIdAndUpdate(user._id, { 
            tutorId: newTutorId,
            remarks: user.remarks 
              ? `${user.remarks}; 系統修復重複 tutorId` 
              : '系統修復重複 tutorId'
          });

          console.log(`✅ 為用戶 ${user.name} (${user.email}) 分配新 tutorId: ${newTutorId}`);
          fixedCount++;

        } catch (error) {
          console.error(`❌ 修復用戶 ${user.name} 的 tutorId 失敗:`, error);
          errors.push({
            userId: user._id,
            name: user.name,
            email: user.email,
            oldTutorId: tutorId,
            error: error.message
          });
        }
      }
    }

    // 5. 清理 null 值的 tutorId（如果有的話）
    const usersWithNullTutorId = await User.find({
      userType: 'student',
      tutorId: null
    });

    if (usersWithNullTutorId.length > 0) {
      console.log(`🧹 清理 ${usersWithNullTutorId.length} 個學生用戶的 null tutorId`);
      
      for (const user of usersWithNullTutorId) {
        await User.findByIdAndUpdate(user._id, {
          $unset: { tutorId: 1 }
        });
        console.log(`✅ 清理用戶 ${user.name} 的 null tutorId`);
      }
    }

    // 6. 輸出結果
    console.log('\n📊 修復結果:');
    console.log(`✅ 成功修復: ${fixedCount} 個重複的 tutorId`);
    console.log(`❌ 修復失敗: ${errors.length} 個`);
    
    if (errors.length > 0) {
      console.log('\n❌ 修復失敗的用戶:');
      errors.forEach(error => {
        console.log(`  - ${error.name} (${error.email}): ${error.error}`);
      });
    }

    console.log('\n✅ tutorId 重複問題修復完成');

  } catch (error) {
    console.error('❌ 修復 tutorId 重複問題失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 已斷開 MongoDB 連接');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  fixTutorIdDuplicates();
}

module.exports = { fixTutorIdDuplicates };
