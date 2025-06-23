const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';

async function rebuildTutorIdIndex() {
  try {
    console.log('🔌 連接到 MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ 已連接到 MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // 先移除舊有 unique index（如果已存在）
    try {
      await users.dropIndex('tutorId_1');
      console.log('✅ 已移除舊有 tutorId_1 index');
    } catch (err) {
      console.log('⚠️ 無法移除舊 index（可能不存在）:', err.message);
    }

    // 建立新的 sparse unique index
    await users.createIndex({ tutorId: 1 }, { unique: true, sparse: true });
    console.log('✅ 已建立 sparse unique index on tutorId');

    console.log('🎉 索引重建完成！');

  } catch (err) {
    console.error('❌ 發生錯誤:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

rebuildTutorIdIndex(); 