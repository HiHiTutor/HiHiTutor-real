const mongoose = require('mongoose');
const TutorApplication = require('../models/TutorApplication');

// 連接資料庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hihitutor:HiHiTutor2024@cluster0.8qjqj.mongodb.net/hihitutor?retryWrites=true&w=majority');
    console.log('✅ 資料庫連接成功');
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error);
    process.exit(1);
  }
};

// 種子數據
const seedTutorApplications = async () => {
  try {
    await connectDB();
    
    // 清除現有數據
    await TutorApplication.deleteMany({});
    console.log('🗑️ 已清除現有導師申請數據');
    
    // 創建新的測試數據
    const testApplications = [
      {
        id: 'TA001',
        userId: 'user_1',
        userNumber: 'U001',
        name: '張小明',
        email: 'zhang@example.com',
        phone: '91234567',
        gender: 'male',
        birthDate: '1990-01-01',
        education: '香港大學數學系畢業',
        experience: 3,
        courseFeatures: '專精於中學數學和物理教學，注重學生理解',
        subjects: ['secondary-math', 'secondary-physics'],
        regions: ['hong-kong-island', 'kowloon'],
        teachingMode: ['in-person', 'online'],
        hourlyRate: '300',
        documents: ['degree_certificate.pdf', 'teaching_certificate.pdf'],
        status: 'approved',
        reviewedAt: new Date(),
        remarks: '資料齊全，審核通過'
      },
      {
        id: 'TA002',
        userId: 'user_2',
        userNumber: 'U002',
        name: '李美華',
        email: 'li@example.com',
        phone: '91234568',
        gender: 'female',
        birthDate: '1988-05-15',
        education: '香港中文大學英文系碩士',
        experience: 5,
        courseFeatures: '專精於小學和中學英文教學，有豐富的DSE經驗',
        subjects: ['primary-english', 'secondary-english'],
        regions: ['all-hong-kong', 'new-territories'],
        teachingMode: ['online'],
        hourlyRate: '250',
        documents: ['master_degree.pdf', 'ielts_certificate.pdf'],
        status: 'approved',
        reviewedAt: new Date(),
        remarks: '學歷優秀，教學經驗豐富'
      },
      {
        id: 'TA003',
        userId: 'user_3',
        userNumber: 'U003',
        name: '陳志強',
        email: 'chen@example.com',
        phone: '91234569',
        gender: 'male',
        birthDate: '1992-08-20',
        education: '香港科技大學化學系畢業',
        experience: 2,
        courseFeatures: '專精於中學化學教學，注重實驗操作',
        subjects: ['secondary-chemistry'],
        regions: ['kowloon', 'islands'],
        teachingMode: ['in-person', 'online'],
        hourlyRate: '280',
        documents: ['degree_certificate.pdf'],
        status: 'pending'
      },
      {
        id: 'TA004',
        userId: 'user_4',
        userNumber: 'U004',
        name: '王雅婷',
        email: 'wang@example.com',
        phone: '91234570',
        gender: 'female',
        birthDate: '1985-12-10',
        education: '香港大學生物系博士',
        experience: 8,
        courseFeatures: '專精於中學生物教學，有豐富的IB和DSE經驗',
        subjects: ['secondary-biology', 'ib-biology'],
        regions: ['hong-kong-island', 'new-territories'],
        teachingMode: ['in-person', 'online'],
        hourlyRate: '400',
        documents: ['phd_certificate.pdf', 'teaching_award.pdf'],
        status: 'pending'
      }
    ];
    
    // 插入數據
    await TutorApplication.insertMany(testApplications);
    console.log('✅ 成功創建', testApplications.length, '筆導師申請數據');
    
    // 驗證數據
    const count = await TutorApplication.countDocuments();
    console.log('📊 數據庫中現有', count, '筆導師申請記錄');
    
    // 顯示包含 regions 的記錄
    const applicationsWithRegions = await TutorApplication.find({ regions: { $exists: true, $ne: [] } });
    console.log('🌍 包含授課地區的記錄:', applicationsWithRegions.length, '筆');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 種子數據創建失敗:', error);
    process.exit(1);
  }
};

seedTutorApplications();
