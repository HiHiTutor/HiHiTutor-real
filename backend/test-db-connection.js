require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 檢查環境變數載入...');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
  const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv?:\/\/[^:]+:)[^@]+(@.*)/, '$1[PASSWORD]$2');
  console.log('- MONGODB_URI:', maskedUri);
  console.log('- MONGODB_URI length:', process.env.MONGODB_URI.length);
} else {
  console.error('❌ MONGODB_URI 未設定！');
  console.log('請檢查以下項目：');
  console.log('1. 是否有 .env 文件');
  console.log('2. .env 文件中是否有 MONGODB_URI 設定');
  console.log('3. 是否在正確的目錄中執行');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('\n🔄 測試數據庫連接...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000
    };

    console.log('連接選項:', options);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ 數據庫連接成功！');
    console.log('- Host:', conn.connection.host);
    console.log('- Database:', conn.connection.name);
    console.log('- Connection State:', conn.connection.readyState);
    
    // 測試查詢
    console.log('\n🧪 測試查詢...');
    const User = require('./models/User');
    const count = await User.countDocuments();
    console.log(`✅ 用戶數量: ${count}`);
    
    // 測試導師查詢
    const tutorCount = await User.countDocuments({ userType: 'tutor' });
    console.log(`✅ 導師數量: ${tutorCount}`);
    
    // 測試待審核導師查詢
    const pendingTutors = await User.countDocuments({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    });
    console.log(`✅ 待審核導師數量: ${pendingTutors}`);
    
    await mongoose.disconnect();
    console.log('\n🔌 已斷開數據庫連接');
    
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    if (error.code === 18) {
      console.error('🔐 認證失敗 - 檢查用戶名/密碼');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 網絡錯誤 - 檢查網絡連接和 MongoDB URI');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ 連接超時 - 檢查網絡和 MongoDB 服務器');
    }
    
    process.exit(1);
  }
}

testConnection(); 