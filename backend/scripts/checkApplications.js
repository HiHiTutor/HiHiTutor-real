const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // 檢查TutorApplication集合
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // 嘗試獲取TutorApplication數據
    try {
      const applications = await db.collection('tutorapplications').find({}).toArray();
      console.log(`\nTutorApplication count: ${applications.length}`);
      
      if (applications.length > 0) {
        console.log('\nFirst application:');
        console.log(JSON.stringify(applications[0], null, 2));
      }
    } catch (error) {
      console.log('TutorApplication collection not found or error:', error.message);
    }
    
    // 檢查User集合中是否有subjects數據
    const User = require('../models/User');
    const usersWithSubjects = await User.find({
      'tutorProfile.subjects': { $exists: true, $ne: [] }
    });
    
    console.log(`\nUsers with non-empty subjects: ${usersWithSubjects.length}`);
    
    if (usersWithSubjects.length > 0) {
      console.log('\nUsers with subjects:');
      usersWithSubjects.forEach(user => {
        console.log(`${user.name}: [${user.tutorProfile.subjects.join(', ')}]`);
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 