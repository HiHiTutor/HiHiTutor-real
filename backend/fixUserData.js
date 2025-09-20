// 直接修復用戶數據的腳本
// 根據你的數據，publicCertificates 有 4 個文件，但 educationCert 只有 3 個

const mongoose = require('mongoose');

// 直接使用連接字符串
const MONGODB_URI = 'mongodb+srv://hihitutor:HiHiTutor2024@hihitutor.8qjqj.mongodb.net/hihitutor?retryWrites=true&w=majority';

// 用戶數據
const userData = {
  userId: '1001000',
  publicCertificates: [
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1757349991036-ChatGPT_Image_2025___7___13__________08_02_09.png",
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1756572113707-_______________.png",
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1758362820864-asus.jpg",
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1756572728552-_______________.png"
  ],
  educationCert: [
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1757349991036-ChatGPT_Image_2025___7___13__________08_02_09.png",
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1756572728552-_______________.png",
    "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1756572113707-_______________.png"
  ]
};

async function fixUserData() {
  try {
    console.log('🔗 連接到 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 連接成功');

    // 導入 User 模型
    const User = require('./models/User');
    
    // 查找用戶
    const user = await User.findOne({ userId: userData.userId });
    if (!user) {
      console.log('❌ 用戶不存在:', userData.userId);
      return;
    }
    
    console.log('🔍 找到用戶:', user.name);
    console.log('📊 當前 publicCertificates 數量:', user.tutorProfile?.publicCertificates?.length || 0);
    console.log('📊 當前 educationCert 數量:', user.documents?.educationCert?.length || 0);
    
    // 更新數據，確保兩個字段都有相同的 4 個文件
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'tutorProfile.publicCertificates': userData.publicCertificates,
          'documents.educationCert': userData.publicCertificates  // 使用相同的文件列表
        }
      },
      { new: true }
    );
    
    console.log('✅ 數據修復完成!');
    console.log('📊 修復後 publicCertificates 數量:', updatedUser.tutorProfile.publicCertificates.length);
    console.log('📊 修復後 educationCert 數量:', updatedUser.documents.educationCert.length);
    
    // 驗證修復結果
    console.log('\n🔍 驗證修復結果:');
    console.log('publicCertificates:', updatedUser.tutorProfile.publicCertificates);
    console.log('educationCert:', updatedUser.documents.educationCert);
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
    process.exit(0);
  }
}

fixUserData();
