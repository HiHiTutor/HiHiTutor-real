const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 查找所有用戶
    const users = await User.find({}).select('userId name email phone userType role status createdAt');
    
    console.log(`📊 Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('\n📋 All users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.userId})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phone}`);
      console.log(`   👤 Type: ${user.userType}, Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log('');
    });

    // 查找包含 90767559 的用戶
    console.log('🔍 Searching for users with phone containing "90767559"...');
    const matchingUsers = await User.find({ 
      phone: { $regex: '90767559' } 
    }).select('userId name email phone userType role status');
    
    console.log(`Found ${matchingUsers.length} users with matching phone:`);
    matchingUsers.forEach(user => {
      console.log(`- ${user.name}: ${user.phone} (${user.userType}/${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUsers(); 