const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`Total users: ${users.length}`);
    
    const individualUsers = await User.find({ userType: 'individual' });
    console.log(`Individual users: ${individualUsers.length}`);
    
    // 檢查前3個individual用戶的subjects
    for (let i = 0; i < Math.min(3, individualUsers.length); i++) {
      const user = individualUsers[i];
      console.log(`\nUser ${i + 1}: ${user.name}`);
      console.log(`userType: ${user.userType}`);
      console.log(`tutorProfile exists: ${!!user.tutorProfile}`);
      
      if (user.tutorProfile && user.tutorProfile.subjects) {
        console.log(`subjects: [${user.tutorProfile.subjects.join(', ')}]`);
      } else {
        console.log(`subjects: null or empty`);
      }
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 