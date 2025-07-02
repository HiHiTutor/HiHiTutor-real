const mongoose = require('mongoose');

// 連線狀態追蹤
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;

const connectDB = async () => {
  try {
    connectionAttempts++;
    console.log(`🔄 Connecting to MongoDB... (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`);
    
    // 檢查是否已連接
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return;
    }
    
    // 檢查是否正在連接
    if (mongoose.connection.readyState === 2) {
      console.log('⏳ Already connecting to MongoDB, please wait...');
      return;
    }
    
    // 檢查環境變數
    console.log('📋 Environment Check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // 新增 DEBUG log 來顯示 MONGODB_URI（遮蔽密碼）
    if (process.env.MONGODB_URI) {
      const uri = process.env.MONGODB_URI;
      const maskedUri = uri.replace(/(mongodb\+srv?:\/\/[^:]+:)[^@]+(@.*)/, '$1[PASSWORD]$2');
      console.log('[DEBUG] MONGODB_URI =', maskedUri);
      console.log('- MONGODB_URI starts with:', uri.substring(0, 20) + '...');
      console.log('- MONGODB_URI length:', uri.length);
    } else {
      console.error('❌ MONGODB_URI is missing!');
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 減少超時時間
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 5, // 減少連接池大小
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
      bufferCommands: true,
      autoIndex: false // 禁用自動索引創建
    };

    console.log('🔗 Attempting MongoDB connection with options:', {
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
      socketTimeoutMS: options.socketTimeoutMS,
      connectTimeoutMS: options.connectTimeoutMS,
      maxPoolSize: options.maxPoolSize
    });

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('✅ MongoDB Connected Successfully!');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- Connection State:', conn.connection.readyState);
    console.log('- Connection String:', conn.connection.client.s.url);
    
    // 重置重試計數
    connectionAttempts = 0;
    
    // 監聽連接事件（避免重複設置）
    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        console.log('🟢 Mongoose connected to MongoDB');
      });
    }

    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.on('error', (err) => {
        console.error('🔴 Mongoose connection error:', {
          message: err.message,
          code: err.code,
          name: err.name,
          stack: err.stack
        });
      });
    }

    if (!mongoose.connection.listeners('disconnected').length) {
      mongoose.connection.on('disconnected', () => {
        console.log('🟡 Mongoose disconnected from MongoDB');
      });
    }

    // 優雅關閉連接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('💤 Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // 如果是認證錯誤
    if (error.code === 18) {
      console.error('🔐 Authentication failed - check username/password');
    }
    // 如果是網絡錯誤
    else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network error - check internet connection and MongoDB URI');
    }
    // 如果是超時錯誤
    else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout - check network and MongoDB server');
    }
    
    // 重試連接（避免無限重試）
    if (connectionAttempts < MAX_RETRY_ATTEMPTS && mongoose.connection.readyState === 0) {
      console.log(`🔄 Retrying connection in 5 seconds... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`);
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connectDB();
      }, 5000);
    } else if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error('❌ Max retry attempts reached, giving up');
      console.error('Please check your MongoDB URI and network connection');
    } else {
      console.log('⚠️ Connection already in progress, skipping retry');
    }
  }
};

// 連線狀態檢查函數
const getConnectionStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    readyState: mongoose.connection.readyState,
    stateDescription: states[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1,
    isConnecting: mongoose.connection.readyState === 2,
    host: mongoose.connection.host,
    database: mongoose.connection.name,
    connectionAttempts
  };
};

module.exports = { connectDB, getConnectionStatus }; 