const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // 檢查tutors集合
    try {
      const tutors = await db.collection('tutors').find({}).toArray();
      console.log(`\nTutors collection count: ${tutors.length}`);
      
      if (tutors.length > 0) {
        console.log('\nFirst tutor:');
        console.log(JSON.stringify(tutors[0], null, 2));
        
        // 檢查前3個導師的subjects
        for (let i = 0; i < Math.min(3, tutors.length); i++) {
          const tutor = tutors[i];
          console.log(`\nTutor ${i + 1}: ${tutor.name || tutor.userId}`);
          if (tutor.subjects) {
            console.log(`subjects: [${tutor.subjects.join(', ')}]`);
          } else {
            console.log(`subjects: null or empty`);
          }
        }
      }
    } catch (error) {
      console.log('Tutors collection not found or error:', error.message);
    }
    
    // 檢查tutorcases集合
    try {
      const tutorCases = await db.collection('tutorcases').find({}).toArray();
      console.log(`\nTutorCases collection count: ${tutorCases.length}`);
      
      if (tutorCases.length > 0) {
        console.log('\nFirst tutor case:');
        console.log(JSON.stringify(tutorCases[0], null, 2));
      }
    } catch (error) {
      console.log('TutorCases collection not found or error:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 