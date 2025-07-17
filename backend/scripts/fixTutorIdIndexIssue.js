const mongoose = require('mongoose');
require('dotenv').config();

async function fixTutorIdIndexIssue() {
  try {
    console.log('🔗 連接到 MongoDB...');
    const uri = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';
    await mongoose.connect(uri);
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
      await users.dropIndex(index.name);
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
  } catch (error) {
    console.error('❌ 修復 tutorId 索引時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開 MongoDB 連接');
  }
}

fixTutorIdIndexIssue(); 