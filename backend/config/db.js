const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('👉 Connecting to MongoDB URI:', uri ? `${uri.substring(0, 20)}...` : 'undefined'); // for debug (hide sensitive info)
    if (!uri) throw new Error('❌ MONGODB_URI is undefined!');
    
    // 如果已經連接，不需要重新連接
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 增加超時時間
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10, // 連接池大小
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false, // 禁用 mongoose 緩衝
      bufferMaxEntries: 0
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // 監聽連接事件
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔍 Error details:', error);
    
    // 在 serverless 環境中不要退出進程
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ In production environment, not exiting process');
      return;
    }
    
    // 只在開發環境中退出進程
    process.exit(1);
  }
};

module.exports = connectDB; 