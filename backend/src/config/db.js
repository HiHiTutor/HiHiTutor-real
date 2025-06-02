const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  const connect = async () => {
    try {
      console.log('🔄 正在連接到 MongoDB...');
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.error(`❌ MongoDB 連接錯誤: ${error.message}`);
      if (error.message.includes('IP that isn\'t whitelisted')) {
        console.log('⚠️ 請確保當前 IP 地址已添加到 MongoDB Atlas IP 白名單中');
        console.log('📝 Vercel 部署環境需要將以下 IP 範圍添加到白名單:');
        console.log('76.76.21.0/24');
      }
      return false;
    }
  };

  while (retryCount < maxRetries) {
    const connected = await connect();
    if (connected) return;

    retryCount++;
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`🔄 ${retryCount}/${maxRetries} 次重試失敗，等待 ${delay/1000} 秒後重試...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('❌ MongoDB 連接失敗，已達到最大重試次數');
  process.exit(1);
};

module.exports = connectDB; 