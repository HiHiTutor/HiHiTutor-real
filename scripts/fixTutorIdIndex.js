// 修正 tutorId 索引問題
// 刪除原有錯誤的 unique index tutorId_1（因為冇 sparse）
// 建立正確的 unique + sparse index，令 null 唔會觸發重複錯誤

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';

async function fixTutorIdIndex() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 連接到 MongoDB...');
    await client.connect();
    console.log('✅ MongoDB 連接成功');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // 檢查現有的索引
    console.log('🔍 檢查現有索引...');
    const indexes = await usersCollection.indexes();
    console.log('現有索引:', indexes.map(idx => idx.name));
    
    // 嘗試刪除舊的 tutorId_1 index（如果存在）
    try {
      await usersCollection.dropIndex('tutorId_1');
      console.log('✅ 成功刪除舊的 tutorId_1 index');
    } catch (err) {
      console.log('⚠️ tutorId_1 index 不存在或已刪除:', err.message);
    }
    
    // 建立新的 sparse + unique index
    console.log('🔧 建立新的 sparse + unique index...');
    await usersCollection.createIndex(
      { tutorId: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ 成功建立 tutorId sparse + unique index');
    
    // 驗證新索引
    console.log('🔍 驗證新索引...');
    const newIndexes = await usersCollection.indexes();
    const tutorIdIndex = newIndexes.find(idx => idx.key && idx.key.tutorId);
    console.log('新的 tutorId 索引:', tutorIdIndex);
    
    console.log('🎉 索引修正完成！');
    
  } catch (error) {
    console.error('❌ 執行時發生錯誤:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 連接已關閉');
  }
}

// 執行修正
fixTutorIdIndex(); 