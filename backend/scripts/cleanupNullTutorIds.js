const mongoose = require('mongoose');

async function cleanupNullTutorIds() {
  try {
    console.log('🔗 連接到 MongoDB...');
    
    // 在生產環境中，MONGODB_URI 應該已經設定
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 環境變數未設定');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 成功連接到 MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    console.log('🔍 檢查 tutorId 為 null 的用戶...');
    const nullTutorIdUsers = await users.find({ tutorId: null }).toArray();
    console.log(`📊 找到 ${nullTutorIdUsers.length} 個 tutorId 為 null 的用戶`);

    if (nullTutorIdUsers.length === 0) {
      console.log('✅ 沒有找到 tutorId 為 null 的用戶，無需清理');
      return {
        success: true,
        message: '沒有找到需要清理的數據',
        cleanedCount: 0
      };
    }

    // 顯示要清理的用戶信息
    console.log('📋 要清理的用戶:');
    nullTutorIdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, UserType: ${user.userType}`);
    });

    // 執行清理操作：移除 tutorId 字段
    console.log('🧹 開始清理 tutorId 為 null 的用戶...');
    const result = await users.updateMany(
      { tutorId: null },
      { $unset: { tutorId: "" } }
    );

    console.log('✅ 清理完成');
    console.log(`📊 清理結果:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    // 驗證清理結果
    const remainingNullTutorIdUsers = await users.find({ tutorId: null }).toArray();
    console.log(`🔍 清理後，還有 ${remainingNullTutorIdUsers.length} 個 tutorId 為 null 的用戶`);

    return {
      success: true,
      message: 'tutorId 清理完成',
      cleanedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      remainingNullCount: remainingNullTutorIdUsers.length
    };
  } catch (error) {
    console.error('❌ 清理 tutorId 時發生錯誤:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開 MongoDB 連接');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  cleanupNullTutorIds()
    .then(result => {
      console.log('🎉 腳本執行完成:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = cleanupNullTutorIds; 