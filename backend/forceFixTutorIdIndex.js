// 強制修正 tutorId 索引問題
// 確保在 Vercel 環境中也能正確執行

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';

async function forceFixTutorIdIndex() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 連接到 MongoDB...');
    console.log('📡 連接 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // 隱藏密碼
    await client.connect();
    console.log('✅ MongoDB 連接成功');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // 檢查現有的索引
    console.log('🔍 檢查現有索引...');
    const indexes = await usersCollection.indexes();
    console.log('現有索引:', indexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique,
      sparse: idx.sparse
    })));
    
    // 找到 tutorId 相關的索引
    const tutorIdIndexes = indexes.filter(idx => idx.key && idx.key.tutorId);
    console.log('🔍 找到的 tutorId 索引:', tutorIdIndexes);
    
    // 刪除所有 tutorId 相關的索引
    for (const index of tutorIdIndexes) {
      try {
        console.log(`🗑️ 刪除索引: ${index.name}`);
        await usersCollection.dropIndex(index.name);
        console.log(`✅ 成功刪除索引: ${index.name}`);
      } catch (err) {
        console.log(`⚠️ 刪除索引 ${index.name} 失敗:`, err.message);
      }
    }
    
    // 強制建立新的 sparse + unique index
    console.log('🔧 強制建立新的 sparse + unique index...');
    await usersCollection.createIndex(
      { tutorId: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'tutorId_1' // 明確指定名稱
      }
    );
    console.log('✅ 成功建立 tutorId sparse + unique index');
    
    // 驗證新索引
    console.log('🔍 驗證新索引...');
    const newIndexes = await usersCollection.indexes();
    const newTutorIdIndex = newIndexes.find(idx => idx.key && idx.key.tutorId);
    console.log('新的 tutorId 索引:', {
      name: newTutorIdIndex.name,
      key: newTutorIdIndex.key,
      unique: newTutorIdIndex.unique,
      sparse: newTutorIdIndex.sparse
    });
    
    // 測試插入 null 值
    console.log('🧪 測試插入 null tutorId...');
    try {
      const testDoc = {
        name: 'TEST_USER_' + Date.now(),
        email: 'test' + Date.now() + '@test.com',
        phone: '12345678',
        password: 'test123',
        userType: 'student',
        tutorId: null
      };
      
      await usersCollection.insertOne(testDoc);
      console.log('✅ 成功插入 null tutorId，索引工作正常');
      
      // 清理測試資料
      await usersCollection.deleteOne({ email: testDoc.email });
      console.log('🧹 清理測試資料完成');
      
    } catch (testError) {
      console.error('❌ 測試失敗:', testError.message);
    }
    
    console.log('🎉 索引強制修正完成！');
    
  } catch (error) {
    console.error('❌ 執行時發生錯誤:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 連接已關閉');
    process.exit(0);
  }
}

// 執行強制修正
forceFixTutorIdIndex(); 