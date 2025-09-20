const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB 連接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 修復用戶文件同步問題
const fixUserFiles = async (userId) => {
  try {
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      console.log('❌ 用戶不存在:', userId);
      return;
    }
    
    console.log('🔍 用戶:', user.name, '(ID:', userId, ')');
    
    // 獲取當前數據
    const currentPublicCerts = user.tutorProfile?.publicCertificates || [];
    const currentEducationCerts = user.documents?.educationCert || [];
    
    console.log('📊 當前 publicCertificates 數量:', currentPublicCerts.length);
    console.log('📊 當前 educationCert 數量:', currentEducationCerts.length);
    
    // 如果 publicCertificates 有 4 個文件，但 educationCert 只有 3 個
    // 則將 publicCertificates 的內容同步到 educationCert
    if (currentPublicCerts.length === 4 && currentEducationCerts.length === 3) {
      console.log('🔧 修復 educationCert 數據...');
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            'documents.educationCert': currentPublicCerts
          }
        },
        { new: true }
      );
      
      console.log('✅ 修復完成!');
      console.log('📊 修復後 educationCert 數量:', updatedUser.documents.educationCert.length);
      console.log('📊 修復後 publicCertificates 數量:', updatedUser.tutorProfile.publicCertificates.length);
      
      return updatedUser;
    } else {
      console.log('ℹ️ 數據已同步，無需修復');
      return user;
    }
  } catch (error) {
    console.error('❌ 修復用戶文件失敗:', error);
  }
};

// 主函數
const main = async () => {
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('❌ 請提供用戶 ID');
    console.log('用法: node fixUserFiles.js <userId>');
    process.exit(1);
  }
  
  await connectDB();
  await fixUserFiles(userId);
  
  console.log('🎉 修復完成，正在關閉連接...');
  await mongoose.connection.close();
  process.exit(0);
};

main().catch(console.error);
