const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HiHiTutorReally');
    console.log('✅ Connected to MongoDB');

    // 獲取 tutorcases 集合
    const collection = mongoose.connection.collection('tutorcases');
    
    // 列出所有索引
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes);

    // 刪除 id_1 索引
    try {
      await collection.dropIndex('id_1');
      console.log('✅ Successfully dropped id_1 index');
    } catch (err) {
      if (err.code === 26) {
        console.log('ℹ️ Index id_1 does not exist');
      } else {
        throw err;
      }
    }

    // 再次列出索引確認
    const remainingIndexes = await collection.indexes();
    console.log('📋 Remaining indexes:', remainingIndexes);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // 關閉連接
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// 執行腳本
dropIndex(); 