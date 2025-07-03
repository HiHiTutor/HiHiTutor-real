const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const mockTutors = require('../data/tutors');

// 連接 MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 連接 MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 生成隨機電話號碼
const generatePhone = () => {
  return Math.floor(Math.random() * 90000000) + 10000000; // 8位數字
};

// 生成隨機 email
const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return typeof name === 'string'
    ? `${name.toLowerCase().replace(/\s+/g, '')}${randomNum}@${domain}`
    : `unknown${randomNum}@${domain}`;
};

// 生成隨機密碼
const generatePassword = () => {
  return 'password123'; // 簡單密碼，實際使用時應該加密
};

// 轉換假資料為資料庫格式
const convertMockTutorToUser = (mockTutor) => {
  const phone = generatePhone();
  const email = generateEmail(mockTutor.name);
  
  return {
    userId: String(mockTutor.id),
    tutorId: `T${String(mockTutor.id).padStart(3, '0')}`,
    name: mockTutor.name,
    email: email,
    phone: phone.toString(),
    password: generatePassword(),
    userType: 'tutor',
    role: 'user',
    avatar: mockTutor.avatarUrl,
    isActive: true,
    status: 'active',
    isTop: mockTutor.isTop,
    isVip: mockTutor.isVip,
    rating: mockTutor.rating,
    totalReviews: Math.floor(Math.random() * 50) + 5,
    profileStatus: 'approved',
    tutorProfile: {
      displayPublic: true,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      birthDate: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      teachingExperienceYears: parseInt(mockTutor.experience.match(/\d+/)[0]),
      educationLevel: mockTutor.education,
      subjects: [mockTutor.subject],
      examResults: [
        {
          subject: mockTutor.subject,
          grade: ['A', 'A+', 'B+'][Math.floor(Math.random() * 3)]
        }
      ],
      teachingAreas: ['香港島', '九龍', '新界'][Math.floor(Math.random() * 3)],
      availableTime: [
        { day: '星期一', time: '18:00-20:00' },
        { day: '星期三', time: '18:00-20:00' },
        { day: '星期六', time: '14:00-16:00' }
      ],
      teachingMethods: ['一對一', '小組教學'],
      classType: ['實體課', '網上課'],
      sessionRate: 150 + Math.floor(Math.random() * 100),
      introduction: `${mockTutor.name}，${mockTutor.education}畢業，擁有${mockTutor.experience}。專精於${mockTutor.subject}教學，深受學生喜愛。`,
      courseFeatures: `- 個人化教學計劃\n- 定期進度評估\n- 豐富的練習題庫\n- 考試技巧指導`,
      avatarUrl: mockTutor.avatarUrl,
      applicationStatus: 'approved'
    },
    documents: {
      idCard: null,
      educationCert: null
    }
  };
};

// 導入假資料到資料庫
const importMockTutors = async () => {
  try {
    console.log('\n📥 開始導入假資料到資料庫');
    console.log('=' .repeat(60));
    
    // 檢查是否已有導師資料
    const existingTutors = await User.find({ userType: 'tutor' });
    console.log(`📋 現有導師數量: ${existingTutors.length}`);
    
    if (existingTutors.length > 0) {
      console.log('⚠️  資料庫中已有導師資料');
      console.log('❓ 是否要清空現有資料並重新導入？(y/N)');
      
      // 這裡可以加入互動確認，但為了自動化，我們直接繼續
      console.log('🔄 繼續導入新資料...');
    }
    
    // 轉換假資料
    const usersToInsert = mockTutors.map(convertMockTutorToUser);
    
    console.log(`📝 準備導入 ${usersToInsert.length} 個導師資料`);
    
    // 批量插入資料
    const result = await User.insertMany(usersToInsert);
    
    console.log(`✅ 成功導入 ${result.length} 個導師資料`);
    
    // 顯示導入的導師資訊
    console.log('\n📋 導入的導師列表:');
    result.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.email})`);
      console.log(`   - 科目: ${tutor.tutorProfile.subjects.join(', ')}`);
      console.log(`   - 評分: ${tutor.rating}`);
      console.log(`   - 精選: ${tutor.isTop ? '是' : '否'}`);
      console.log(`   - VIP: ${tutor.isVip ? '是' : '否'}`);
    });
    
    // 統計資訊
    const totalTutors = await User.find({ userType: 'tutor' });
    const featuredTutors = totalTutors.filter(t => t.isTop || t.isVip);
    const approvedTutors = totalTutors.filter(t => t.profileStatus === 'approved');
    
    console.log('\n📊 統計資訊:');
    console.log(`- 總導師數量: ${totalTutors.length}`);
    console.log(`- 精選導師: ${featuredTutors.length} 個`);
    console.log(`- 已審核導師: ${approvedTutors.length} 個`);
    
    if (featuredTutors.length > 0) {
      console.log('\n🎉 現在有精選導師了！');
      console.log('✅ /api/tutors?featured=true 查詢會有結果');
    }
    
  } catch (error) {
    console.error('❌ 導入假資料時出錯:', error);
    
    if (error.code === 11000) {
      console.log('⚠️  重複資料錯誤，可能某些 email 或 phone 已存在');
      console.log('💡 建議清空現有導師資料後重新執行');
    }
  }
};

// 清空現有導師資料（可選）
const clearExistingTutors = async () => {
  try {
    console.log('\n🗑️  清空現有導師資料...');
    const result = await User.deleteMany({ userType: 'tutor' });
    console.log(`✅ 已刪除 ${result.deletedCount} 個導師資料`);
  } catch (error) {
    console.error('❌ 清空資料時出錯:', error);
  }
};

// 主程式
const main = async () => {
  await connectDB();
  
  // 先清空現有資料
  await clearExistingTutors();
  
  await importMockTutors();
  await mongoose.connection.close();
  console.log('\n✅ 導入完成');
};

main().catch(console.error); 