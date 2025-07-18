const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const individualUsers = await User.find({ userType: 'individual' });
    console.log(`\nIndividual users: ${individualUsers.length}`);
    
    let completeProfiles = 0;
    let incompleteProfiles = 0;
    
    for (const user of individualUsers) {
      console.log(`\n👤 ${user.name} (${user.userId})`);
      
      const profile = user.tutorProfile || {};
      const hasSubjects = profile.subjects && profile.subjects.length > 0;
      const hasEducation = profile.educationLevel;
      const hasExperience = profile.teachingExperienceYears !== undefined;
      const hasRate = profile.sessionRate;
      
      console.log(`   subjects: ${hasSubjects ? '✅' : '❌'} [${profile.subjects?.join(', ') || 'empty'}]`);
      console.log(`   education: ${hasEducation ? '✅' : '❌'} ${profile.educationLevel || 'empty'}`);
      console.log(`   experience: ${hasExperience ? '✅' : '❌'} ${profile.teachingExperienceYears || 'empty'}`);
      console.log(`   rate: ${hasRate ? '✅' : '❌'} ${profile.sessionRate || 'empty'}`);
      
      if (hasSubjects && hasEducation && hasExperience && hasRate) {
        completeProfiles++;
        console.log(`   📊 完整度: ✅ 完整`);
      } else {
        incompleteProfiles++;
        console.log(`   📊 完整度: ❌ 不完整`);
      }
    }
    
    console.log(`\n📈 總結:`);
    console.log(`   完整資料: ${completeProfiles} 個`);
    console.log(`   不完整資料: ${incompleteProfiles} 個`);
    
    if (completeProfiles > 0) {
      console.log(`\n💡 建議: 可以將 ${completeProfiles} 個完整資料的用戶升級為tutor`);
    } else {
      console.log(`\n💡 建議: 需要創建測試導師數據`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 