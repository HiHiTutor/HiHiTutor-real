// 清理重複的 null tutorId 值
// 解決 E11000 duplicate key error 問題

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';

async function cleanupNullTutorIds() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 連接到 MongoDB...');
    await client.connect();
    console.log('✅ MongoDB 連接成功');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // 檢查有多少用戶的 tutorId 是 null
    console.log('🔍 檢查 null tutorId 的用戶...');
    const nullTutorIdUsers = await usersCollection.find({ tutorId: null }).toArray();
    console.log(`📊 找到 ${nullTutorIdUsers.length} 個用戶的 tutorId 是 null`);
    
    if (nullTutorIdUsers.length > 0) {
      console.log('📋 null tutorId 用戶列表:');
      nullTutorIdUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - userType: ${user.userType}`);
      });
      
      // 方案1: 將所有 null tutorId 設為 undefined（這樣 sparse index 會忽略它們）
      console.log('🧹 將 null tutorId 設為 undefined...');
      const result = await usersCollection.updateMany(
        { tutorId: null },
        { $unset: { tutorId: "" } }
      );
      console.log(`✅ 更新了 ${result.modifiedCount} 個用戶的 tutorId`);
      
      // 驗證更新結果
      const remainingNullUsers = await usersCollection.find({ tutorId: null }).toArray();
      console.log(`📊 更新後還有 ${remainingNullUsers.length} 個用戶的 tutorId 是 null`);
      
      const undefinedTutorIdUsers = await usersCollection.find({ tutorId: { $exists: false } }).toArray();
      console.log(`📊 有 ${undefinedTutorIdUsers.length} 個用戶的 tutorId 是 undefined`);
    }
    
    // 重新建立索引
    console.log('🔧 重新建立 tutorId 索引...');
    try {
      await usersCollection.dropIndex('tutorId_1');
      console.log('✅ 刪除舊索引');
    } catch (err) {
      console.log('⚠️ 刪除舊索引失敗:', err.message);
    }
    
    await usersCollection.createIndex(
      { tutorId: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'tutorId_1'
      }
    );
    console.log('✅ 重新建立 sparse + unique 索引');
    
    // 測試插入
    console.log('🧪 測試插入新用戶...');
    try {
      const testDoc = {
        name: 'TEST_USER_' + Date.now(),
        email: 'test' + Date.now() + '@test.com',
        phone: '12345678',
        password: 'test123',
        userType: 'student'
        // 不設定 tutorId，讓它保持 undefined
      };
      
      await usersCollection.insertOne(testDoc);
      console.log('✅ 成功插入新用戶，索引工作正常');
      
      // 清理測試資料
      await usersCollection.deleteOne({ email: testDoc.email });
      console.log('🧹 清理測試資料完成');
      
    } catch (testError) {
      console.error('❌ 測試失敗:', testError.message);
    }
    
    console.log('🎉 清理完成！');
    
  } catch (error) {
    console.error('❌ 執行時發生錯誤:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 連接已關閉');
    process.exit(0);
  }
}

// 執行清理
cleanupNullTutorIds(); 