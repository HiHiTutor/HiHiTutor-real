const mongoose = require('mongoose');
const User = require('../models/User');

// 所有標準化科目代碼
const ALL_SUBJECTS = {
  // 幼兒教育
  'early-childhood-chinese': '幼兒中文',
  'early-childhood-english': '幼兒英文', 
  'early-childhood-math': '幼兒數學',
  'early-childhood-phonics': '拼音/注音',
  'early-childhood-logic': '邏輯思維',
  'early-childhood-interview': '面試技巧',
  'early-childhood-homework': '幼稚園功課',
  
  // 小學教育
  'primary-chinese': '小學中文',
  'primary-english': '小學英文',
  'primary-math': '小學數學',
  'primary-general': '常識',
  'primary-mandarin': '普通話',
  'primary-stem': 'STEM',
  'primary-all': '全科補習',
  
  // 中學教育
  'secondary-chinese': '中學中文',
  'secondary-english': '中學英文',
  'secondary-math': '中學數學',
  'secondary-ls': '通識',
  'secondary-physics': '物理',
  'secondary-chemistry': '化學',
  'secondary-biology': '生物',
  'secondary-economics': '經濟',
  'secondary-geography': '地理',
  'secondary-history': '歷史',
  'secondary-chinese-history': '中國歷史',
  'secondary-bafs': '企會財',
  'secondary-ict': '資訊科技',
  'secondary-integrated-science': '綜合科學',
  'secondary-dse': 'DSE',
  
  // 興趣班
  'art': '繪畫',
  'music': '音樂',
  'dance': '跳舞',
  'drama': '戲劇',
  'programming': '編程',
  'foreign-language': '外語',
  'magic-chess': '魔術/棋藝',
  'photography': '攝影',
  
  // 大學課程
  'uni-liberal': '大學通識',
  'uni-math': '大學數學',
  'uni-economics': '經濟學',
  'uni-it': '資訊科技',
  'uni-business': '商科',
  'uni-engineering': '工程',
  'uni-thesis': '論文',
  
  // 成人教育
  'business-english': '商務英文',
  'conversation': '英語會話',
  'chinese-language': '廣東話',
  'second-language': '第二語言',
  'computer-skills': '電腦技能',
  'exam-prep': '考試準備'
};

// 連接雲端數據庫
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 檢查並添加tutor subjects
const checkAndAddTutorSubjects = async () => {
  try {
    console.log('🔍 檢查所有tutor的subjects...');
    
    // 獲取所有導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總共找到 ${tutors.length} 位導師`);
    
    // 統計每個科目的tutor數量
    const subjectCounts = {};
    const tutorsWithoutSubjects = [];
    
    for (const tutor of tutors) {
      const subjects = tutor.tutorProfile?.subjects || [];
      
      if (subjects.length === 0) {
        tutorsWithoutSubjects.push(tutor);
      }
      
      subjects.forEach(subject => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
    }
    
    console.log(`\n📈 Subjects統計:`);
    Object.entries(ALL_SUBJECTS).forEach(([code, name]) => {
      const count = subjectCounts[code] || 0;
      console.log(`   ${code} (${name}): ${count} 個tutor`);
    });
    
    console.log(`\n⚠️  沒有subjects的導師: ${tutorsWithoutSubjects.length} 個`);
    
    // 找出沒有tutor的科目
    const subjectsWithoutTutors = Object.keys(ALL_SUBJECTS).filter(
      subject => !subjectCounts[subject] || subjectCounts[subject] === 0
    );
    
    console.log(`\n❌ 沒有tutor的科目: ${subjectsWithoutTutors.length} 個`);
    subjectsWithoutTutors.forEach(subject => {
      console.log(`   - ${subject} (${ALL_SUBJECTS[subject]})`);
    });
    
    // 為沒有subjects的導師添加subjects
    if (tutorsWithoutSubjects.length > 0) {
      console.log(`\n🔧 為沒有subjects的導師添加subjects...`);
      
      for (let i = 0; i < tutorsWithoutSubjects.length; i++) {
        const tutor = tutorsWithoutSubjects[i];
        const subjectToAdd = subjectsWithoutTutors[i % subjectsWithoutTutors.length] || 'secondary-english';
        
        await User.findByIdAndUpdate(tutor._id, {
          'tutorProfile.subjects': [subjectToAdd]
        });
        
        console.log(`   ✅ ${tutor.name}: 添加 ${subjectToAdd} (${ALL_SUBJECTS[subjectToAdd]})`);
      }
    }
    
    // 為沒有tutor的科目創建新tutor
    if (subjectsWithoutTutors.length > 0) {
      console.log(`\n🔧 為沒有tutor的科目創建新tutor...`);
      
      for (const subject of subjectsWithoutTutors) {
        const tutorId = `T${String(Math.floor(Math.random() * 90000) + 10000)}`;
        const userId = `1000${String(Math.floor(Math.random() * 900) + 100)}`;
        
        const newTutor = new User({
          userId: userId,
          tutorId: tutorId,
          name: `${ALL_SUBJECTS[subject]}導師`,
          email: `tutor${userId}@example.com`,
          phone: String(Math.floor(Math.random() * 90000000) + 10000000),
          password: '$2a$10$xq4RcayWZJPCBOjV2B43MOlkn/B8tn6RdHl6LGdTWvmdf/tIcruLm', // 默認密碼
          userType: 'tutor',
          role: 'user',
          avatar: '/avatars/default.png',
          isActive: true,
          status: 'active',
          tutorProfile: {
            displayPublic: true,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            teachingExperienceYears: Math.floor(Math.random() * 10) + 1,
            educationLevel: '大學',
            subjects: [subject],
            sessionRate: Math.floor(Math.random() * 200) + 200,
            introduction: `我是${ALL_SUBJECTS[subject]}導師，有豐富的教學經驗。`,
            courseFeatures: `專注於${ALL_SUBJECTS[subject]}教學，提供個性化學習方案。`,
            applicationStatus: 'approved'
          },
          rating: Math.floor(Math.random() * 20) / 10 + 3,
          profileStatus: 'approved'
        });
        
        await newTutor.save();
        console.log(`   ✅ 創建新tutor: ${newTutor.name} (${tutorId}) - ${subject} (${ALL_SUBJECTS[subject]})`);
      }
    }
    
    console.log(`\n🎉 完成！現在每個科目都應該有至少1個tutor了。`);
    
  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  await checkAndAddTutorSubjects();
  await mongoose.disconnect();
  console.log('✅ 數據庫連接已關閉');
};

// 執行腳本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkAndAddTutorSubjects }; 