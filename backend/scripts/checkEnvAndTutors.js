const mongoose = require('mongoose');
const User = require('../models/User');

console.log('🔍 檢查環境變數:');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('\n✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // 檢查所有用戶
    const allUsers = await User.find({});
    console.log(`\n📊 總用戶數: ${allUsers.length}`);
    
    // 按userType分類
    const userTypes = {};
    allUsers.forEach(user => {
      const type = user.userType || 'unknown';
      userTypes[type] = (userTypes[type] || 0) + 1;
    });
    
    console.log('\n📋 用戶類型分布:');
    Object.entries(userTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 個`);
    });
    
    // 檢查tutor用戶
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`\n🔍 userType='tutor' 的用戶: ${tutors.length} 個`);
    
    if (tutors.length > 0) {
      console.log('\n前3個tutor用戶:');
      tutors.slice(0, 3).forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.tutorId})`);
        console.log(`   subjects: [${tutor.tutorProfile?.subjects?.join(', ') || 'empty'}]`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  })
  .catch(console.error); 