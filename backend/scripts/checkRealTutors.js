const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // 查找真正的導師用戶
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`\n📊 找到 ${tutors.length} 位真正的導師 (userType: 'tutor')`);
    
    if (tutors.length === 0) {
      console.log('❌ 沒有找到任何導師');
      return;
    }
    
    // 檢查前5個導師的資料
    for (let i = 0; i < Math.min(5, tutors.length); i++) {
      const tutor = tutors[i];
      console.log(`\n👤 導師 ${i + 1}: ${tutor.name} (${tutor.tutorId})`);
      console.log(`   userType: ${tutor.userType}`);
      
      if (tutor.tutorProfile) {
        const profile = tutor.tutorProfile;
        console.log(`   ✅ 有tutorProfile`);
        console.log(`   subjects: [${profile.subjects?.join(', ') || 'empty'}]`);
        console.log(`   education: ${profile.educationLevel || 'empty'}`);
        console.log(`   experience: ${profile.teachingExperienceYears || 'empty'}`);
        console.log(`   rate: ${profile.sessionRate || 'empty'}`);
        console.log(`   displayPublic: ${profile.displayPublic}`);
      } else {
        console.log(`   ❌ 沒有tutorProfile`);
      }
    }
    
    // 統計有subjects的導師
    const tutorsWithSubjects = tutors.filter(t => 
      t.tutorProfile && t.tutorProfile.subjects && t.tutorProfile.subjects.length > 0
    );
    
    console.log(`\n📈 統計:`);
    console.log(`   總導師數: ${tutors.length}`);
    console.log(`   有subjects的導師: ${tutorsWithSubjects.length}`);
    console.log(`   沒有subjects的導師: ${tutors.length - tutorsWithSubjects.length}`);
    
    // 檢查subjects的格式
    if (tutorsWithSubjects.length > 0) {
      console.log(`\n🔍 Subjects格式檢查:`);
      const subjectFormats = new Set();
      tutorsWithSubjects.forEach(tutor => {
        tutor.tutorProfile.subjects.forEach(subject => {
          subjectFormats.add(subject);
        });
      });
      
      console.log(`   發現的subjects:`, Array.from(subjectFormats));
      
      // 檢查是否有中文格式的subjects
      const chineseSubjects = Array.from(subjectFormats).filter(subject => 
        !subject.includes('-') && !subject.startsWith('primary') && !subject.startsWith('secondary')
      );
      
      if (chineseSubjects.length > 0) {
        console.log(`   中文格式subjects: ${chineseSubjects.join(', ')}`);
        console.log(`   💡 需要轉換為標準化代碼`);
      } else {
        console.log(`   ✅ 所有subjects都是標準化格式`);
      }
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(console.error); 