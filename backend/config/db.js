const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
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
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      bufferMaxEntries: 0,
      bufferCommands: false
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
    
    // 監聽連接事件
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

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
    
    // 重試連接
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB; 