require('dotenv').config();
const { ensureConnection, getConnectionStatus } = require('./config/db');

async function testConnection() {
  console.log('🧪 Testing database connection...');
  
  try {
    // Test the ensureConnection function
    await ensureConnection();
    console.log('✅ Database connection test successful');
    
    // Get connection status
    const status = getConnectionStatus();
    console.log('📊 Connection status:', status);
    
    // Test a simple query
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    if (mongoose.connection.readyState === 1) {
      const userCount = await User.countDocuments();
      console.log('📈 Total users in database:', userCount);
    }
    
    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }
}

testConnection();