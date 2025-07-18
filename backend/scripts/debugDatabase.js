const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
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
    
    // 檢查是否有tutor用戶
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`\n🔍 userType='tutor' 的用戶: ${tutors.length} 個`);
    
    if (tutors.length > 0) {
      console.log('\n前3個tutor用戶:');
      tutors.slice(0, 3).forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor._id})`);
      });
    }
    
    // 檢查是否有其他可能的tutor標識
    const possibleTutors = await User.find({
      $or: [
        { userType: 'tutor' },
        { 'tutorProfile.subjects': { $exists: true, $ne: [] } },
        { tutorId: { $exists: true, $ne: null } }
      ]
    });
    
    console.log(`\n🔍 可能的導師用戶 (有tutorProfile或tutorId): ${possibleTutors.length} 個`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 