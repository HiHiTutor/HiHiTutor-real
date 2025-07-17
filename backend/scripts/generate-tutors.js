const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

// 科目列表
const subjects = [
  '數學', '英文', '中文', '物理', '化學', '生物', '歷史', '地理', 
  '經濟', '會計', '電腦', '音樂', '美術', '體育', '普通話'
];

// 地區列表
const teachingAreas = [
  '香港島', '九龍', '新界', '離島', '中西區', '灣仔區', '東區', '南區',
  '油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區', '荃灣區',
  '屯門區', '元朗區', '北區', '大埔區', '西貢區', '沙田區', '葵青區'
];

// 教學方法
const teachingMethods = [
  '一對一教學', '小組教學', '網上教學', '面對面教學', '混合式教學'
];

// 課程類型
const classTypes = [
  '補習班', '考試準備', '功課輔導', '技能提升', '興趣培養'
];

// 生成隨機科目
const getRandomSubjects = () => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3個科目
  const shuffled = subjects.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 生成隨機地區
const getRandomTeachingAreas = () => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3個地區
  const shuffled = teachingAreas.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 生成隨機教學方法
const getRandomTeachingMethods = () => {
  const count = Math.floor(Math.random() * 2) + 1; // 1-2個方法
  const shuffled = teachingMethods.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 生成隨機課程類型
const getRandomClassTypes = () => {
  const count = Math.floor(Math.random() * 2) + 1; // 1-2個類型
  const shuffled = classTypes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 生成隨機香港電話號碼
const generateRandomPhone = () => {
  const prefixes = ['9', '6', '5'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${number}`;
};

// 生成隨機考試成績
const getRandomExamResults = (userSubjects) => {
  return userSubjects.map(subject => ({
    subject: subject,
    grade: ['A', 'B', 'C', 'D'].sort(() => 0.5 - Math.random())[0]
  }));
};

// 生成隨機可用時間
const getRandomAvailableTime = () => {
  const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  const times = ['上午', '下午', '晚上'];
  const count = Math.floor(Math.random() * 5) + 3; // 3-7個時段
  
  const availableTime = [];
  for (let i = 0; i < count; i++) {
    availableTime.push({
      day: days[Math.floor(Math.random() * days.length)],
      time: times[Math.floor(Math.random() * times.length)]
    });
  }
  return availableTime;
};

// 生成 50 個 tutor
const generateTutors = async () => {
  const tutors = [];
  
  for (let i = 0; i < 50; i++) {
    const userSubjects = getRandomSubjects();
    const tutorId = `T${String(100 + i).padStart(5, '0')}`;
    const userId = String(1000100 + i);
    
    const tutor = {
      userId: userId,
      tutorId: tutorId,
      name: `Tutor ${i + 1}`,
      email: `tutor${userId}@example.com`,
      phone: generateRandomPhone(),
      password: bcrypt.hashSync('88888888', 10),
      userType: 'tutor',
      role: 'user',
      avatar: '/avatars/default.png',
      isActive: true,
      status: 'active',
      tutorProfile: {
        displayPublic: Math.random() > 0.3, // 70% 公開顯示
        gender: Math.random() > 0.5 ? 'male' : 'female',
        birthDate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        teachingExperienceYears: Math.floor(Math.random() * 10) + 1, // 1-10年
        educationLevel: ['中學', '大學', '碩士', '博士'][Math.floor(Math.random() * 4)],
        subjects: userSubjects,
        examResults: getRandomExamResults(userSubjects),
        teachingAreas: getRandomTeachingAreas(),
        availableTime: getRandomAvailableTime(),
        teachingMethods: getRandomTeachingMethods(),
        classType: getRandomClassTypes(),
        sessionRate: Math.floor(Math.random() * 400) + 100, // 100-500元
        introduction: `我是${userSubjects.join('、')}導師，有豐富的教學經驗。`,
        courseFeatures: `專注於${userSubjects.join('、')}教學，提供個性化學習方案。`,
        avatarUrl: '/avatars/default.png',
        applicationStatus: 'approved'
      },
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0，小數點後一位
      isTop: Math.random() > 0.8, // 20% 是置頂
      isVip: Math.random() > 0.7, // 30% 是VIP
      totalReviews: Math.floor(Math.random() * 50), // 0-49個評價
      profileStatus: 'approved',
      remarks: ''
    };
    
    tutors.push(tutor);
  }
  
  return tutors;
};

// 執行生成
const main = async () => {
  try {
    console.log('開始生成 50 個 tutor 用戶...');
    
    const tutors = await generateTutors();
    
    // 清空現有的測試 tutor（可選）
    // await User.deleteMany({ email: { $regex: /tutor\d+@example\.com/ } });
    
    // 插入新的 tutor
    const result = await User.insertMany(tutors);
    
    console.log(`成功生成 ${result.length} 個 tutor 用戶！`);
    console.log('生成的 tutor 列表：');
    
    result.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.email}) - ${tutor.tutorProfile.subjects.join(', ')}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('生成 tutor 時發生錯誤：', error);
    mongoose.connection.close();
  }
};

main(); 