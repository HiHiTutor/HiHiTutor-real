import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'your-mongodb-uri'; // 可自動從 .env 拿值
const client = new MongoClient(uri);

async function fixTutorIdIndex() {
  try {
    await client.connect();
    const db = client.db(); // 預設會取 .env 裡設定的資料庫
    const users = db.collection('users');

    // 嘗試移除舊的 tutorId index（如果存在）
    try {
      await users.dropIndex('tutorId_1');
      console.log('✅ 移除舊有 tutorId_1 index');
    } catch (err: any) {
      console.log('⚠️ tutorId_1 index 不存在或已移除：', err.message);
    }

    // 建立新的 sparse + unique index
    await users.createIndex({ tutorId: 1 }, { unique: true, sparse: true });
    console.log('✅ 建立 sparse + unique index 成功');
  } catch (err) {
    console.error('❌ 執行時出錯:', err);
  } finally {
    await client.close();
  }
}

fixTutorIdIndex(); 