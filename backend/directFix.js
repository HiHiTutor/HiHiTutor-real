// 直接修復用戶 1001000 的文件數據
// 根據 S3 實際文件（2個）更新數據庫

const mongoose = require('mongoose');

// 根據你的描述，S3 中只有 2 個文件：
// 1. 1758213464437-asus.jpg
// 2. 1758362820864-asus.jpg

const S3_FILES = [
  "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1758213464437-asus.jpg",
  "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1758362820864-asus.jpg"
];

async function directFix() {
  try {
    // 連接到本地數據庫
    await mongoose.connect('mongodb://localhost:27017/hihitutor');
    console.log('✅ 連接到本地數據庫');
    
    const User = require('./models/User');
    
    // 查找用戶 - 嘗試多種方式
    let user = await User.findOne({ userId: '1001000' });
    if (!user) {
      user = await User.findOne({ tutorId: 'TU0104' });
    }
    if (!user) {
      user = await User.findOne({ name: 'testtutor1' });
    }
    if (!user) {
      user = await User.findOne({ email: 'testtutor1@example.com' });
    }
    
    if (!user) {
      console.log('❌ 找不到用戶，列出所有用戶...');
      const allUsers = await User.find({}).limit(20);
      console.log('所有用戶:');
      allUsers.forEach((u, i) => {
        console.log(`${i+1}. ${u.name} - ${u.email} - userId: ${u.userId} - tutorId: ${u.tutorId}`);
      });
      return;
    }
    
    console.log('🔍 找到用戶:', {
      name: user.name,
      email: user.email,
      userId: user.userId,
      tutorId: user.tutorId
    });
    
    // 顯示當前文件
    console.log('📊 當前 publicCertificates:', user.tutorProfile?.publicCertificates?.length || 0);
    console.log('📊 當前 educationCert:', user.documents?.educationCert?.length || 0);
    
    if (user.tutorProfile?.publicCertificates) {
      console.log('當前 publicCertificates 文件:');
      user.tutorProfile.publicCertificates.forEach((url, i) => {
        console.log(`  ${i+1}. ${url.split('/').pop()}`);
      });
    }
    
    if (user.documents?.educationCert) {
      console.log('當前 educationCert 文件:');
      user.documents.educationCert.forEach((url, i) => {
        console.log(`  ${i+1}. ${url.split('/').pop()}`);
      });
    }
    
    // 更新為 S3 實際文件
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'tutorProfile.publicCertificates': S3_FILES,
          'documents.educationCert': S3_FILES
        }
      },
      { new: true }
    );
    
    console.log('✅ 修復完成!');
    console.log('📊 更新後 publicCertificates 數量:', updatedUser.tutorProfile.publicCertificates.length);
    console.log('📊 更新後 educationCert 數量:', updatedUser.documents.educationCert.length);
    
    console.log('📋 更新後的文件列表:');
    updatedUser.tutorProfile.publicCertificates.forEach((url, i) => {
      console.log(`  ${i+1}. ${url.split('/').pop()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修復失敗:', error);
    process.exit(1);
  }
}

directFix();