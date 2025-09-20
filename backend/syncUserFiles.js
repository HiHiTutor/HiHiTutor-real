const mongoose = require('mongoose');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

// 連接 MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 配置 S3 客戶端
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hihitutor-uploads';

// 獲取 S3 中的文件列表
const getS3Files = async (userId) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `uploads/user-docs/${userId}/`,
    });
    
    const response = await s3Client.send(command);
    const files = response.Contents || [];
    
    return files.map(file => ({
      key: file.Key,
      url: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${file.Key}`,
      filename: file.Key.split('/').pop(),
      size: file.Size,
      lastModified: file.LastModified
    }));
  } catch (error) {
    console.error('❌ 獲取 S3 文件列表失敗:', error);
    return [];
  }
};

// 同步用戶文件
const syncUserFiles = async (userId) => {
  try {
    const User = require('./models/User');
    
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      console.log('❌ 用戶不存在:', userId);
      return;
    }
    
    console.log('🔍 用戶:', user.name, '(ID:', userId, ')');
    
    // 獲取 S3 實際文件
    const s3Files = await getS3Files(userId);
    console.log('📁 S3 文件數量:', s3Files.length);
    s3Files.forEach(file => console.log('  -', file.filename));
    
    // 獲取當前數據庫中的文件
    const currentPublicCerts = user.tutorProfile?.publicCertificates || [];
    const currentEducationCerts = user.documents?.educationCert || [];
    
    console.log('📊 當前 publicCertificates 數量:', currentPublicCerts.length);
    console.log('📊 當前 educationCert 數量:', currentEducationCerts.length);
    
    // 創建 S3 文件 URL 列表
    const s3Urls = s3Files.map(file => file.url);
    
    // 更新 publicCertificates 為 S3 文件列表
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'tutorProfile.publicCertificates': s3Urls,
          'documents.educationCert': s3Urls
        }
      },
      { new: true }
    );
    
    console.log('✅ 同步完成!');
    console.log('📊 更新後 publicCertificates 數量:', updatedUser.tutorProfile.publicCertificates.length);
    console.log('📊 更新後 educationCert 數量:', updatedUser.documents.educationCert.length);
    
    return updatedUser;
  } catch (error) {
    console.error('❌ 同步用戶文件失敗:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  
  const userId = process.argv[2];
  if (!userId) {
    console.log('❌ 請提供用戶 ID');
    console.log('用法: node syncUserFiles.js <userId>');
    process.exit(1);
  }
  
  await syncUserFiles(userId);
  
  console.log('🎉 同步完成，正在關閉連接...');
  await mongoose.connection.close();
  process.exit(0);
};

main().catch(console.error);