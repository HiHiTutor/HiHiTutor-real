const mongoose = require('mongoose');

async function fixTutorIdIndexProduction() {
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

    console.log('🔍 檢查現有的 tutorId 索引...');
    const indexes = await users.indexes();
    const tutorIdIndexes = indexes.filter(index => 
      index.key && Object.keys(index.key).includes('tutorId')
    );

    console.log('📋 現有的 tutorId 索引:', tutorIdIndexes);

    // 刪除所有現有的 tutorId 索引
    for (const index of tutorIdIndexes) {
      console.log(`🗑️ 刪除索引: ${index.name}`);
      try {
        await users.dropIndex(index.name);
        console.log(`✅ 成功刪除索引: ${index.name}`);
      } catch (error) {
        console.log(`⚠️ 刪除索引 ${index.name} 時發生錯誤:`, error.message);
      }
    }

    // 重新創建正確的 sparse + unique 索引
    console.log('🔧 創建新的 tutorId sparse + unique 索引...');
    await users.createIndex(
      { tutorId: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'tutorId_sparse_unique'
      }
    );

    console.log('✅ 成功創建 tutorId sparse + unique 索引');

    // 檢查是否有重複的 null tutorId 值
    console.log('🔍 檢查是否有重複的 null tutorId 值...');
    const nullTutorIdUsers = await users.find({ tutorId: null }).toArray();
    console.log(`📊 找到 ${nullTutorIdUsers.length} 個 tutorId 為 null 的用戶`);

    if (nullTutorIdUsers.length > 1) {
      console.log('⚠️ 發現多個 tutorId 為 null 的用戶，這可能導致索引問題');
      console.log('📋 這些用戶的 ID:', nullTutorIdUsers.map(u => u._id));
    }

    console.log('✅ tutorId 索引修復完成');
    
    return {
      success: true,
      message: 'tutorId 索引修復完成',
      deletedIndexes: tutorIdIndexes.length,
      nullTutorIdCount: nullTutorIdUsers.length
    };
  } catch (error) {
    console.error('❌ 修復 tutorId 索引時發生錯誤:', error);
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
  fixTutorIdIndexProduction()
    .then(result => {
      console.log('🎉 腳本執行完成:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = fixTutorIdIndexProduction; 