const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('👉 Connecting to MongoDB URI:', uri); // for debug
    if (!uri) throw new Error('❌ MONGODB_URI is undefined!');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
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
    process.exit(1);
  }
};

module.exports = connectDB; 