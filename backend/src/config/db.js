const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  let lastError = null;

  const connect = async () => {
    try {
      console.log('🔄 正在連接到 MongoDB...');
      
      // 檢查 MongoDB URI
      if (!process.env.MONGODB_URI) {
        throw new Error('未設置 MONGODB_URI 環境變量');
      }

      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 60000, // 1 分鐘
        socketTimeoutMS: 90000, // 1.5 分鐘
        connectTimeoutMS: 60000, // 1 分鐘
        heartbeatFrequencyMS: 5000, // 每 5 秒檢查一次連接
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // 監聽連接事件
      mongoose.connection.on('connected', () => {
        console.log('🟢 Mongoose 已連接');
      });

      mongoose.connection.on('error', (err) => {
        console.error('🔴 Mongoose 連接錯誤:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🟡 Mongoose 已斷開連接');
      });

      // 優雅地處理進程終止
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('🔵 Mongoose 連接已關閉（由 SIGINT 觸發）');
          process.exit(0);
        } catch (err) {
          console.error('❌ 關閉 Mongoose 連接時出錯:', err);
          process.exit(1);
        }
      });

      return true;
    } catch (error) {
      lastError = error;
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
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // 最多等待 30 秒
      console.log(`🔄 ${retryCount}/${maxRetries} 次重試失敗，等待 ${delay/1000} 秒後重試...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('❌ MongoDB 連接失敗，已達到最大重試次數');
  throw lastError || new Error('無法連接到 MongoDB');
};

module.exports = connectDB; 