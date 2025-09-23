// 修復用戶 1001000 的文件數據
// 根據 S3 實際文件更新數據庫

const mongoose = require('mongoose');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// S3 配置
const s3Client = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAX7VQZQZQZQZQZQZQ',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key'
  }
});

const BUCKET_NAME = 'hihitutor-uploads';
const USER_ID = '1001000';

// 獲取 S3 文件列表
const getS3Files = async (userId) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `uploads/user-docs/${userId}/`,
    });
    
    const response = await s3Client.send(command);
    
    if (response.Contents) {
      return response.Contents.map(file => ({
        key: file.Key,
        filename: file.Key.split('/').pop(),
        url: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${file.Key}`,
        size: file.Size,
        lastModified: file.LastModified
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ 獲取 S3 文件失敗:', error);
    return [];
  }
};

// 修復用戶文件
const fixUserFiles = async () => {
  try {
    // 嘗試多個數據庫連接
    const dbUrls = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/hihitutor',
      'mongodb://localhost:27017/hihitutor-real',
      'mongodb+srv://username:password@cluster.mongodb.net/hihitutor'
    ];
    
    let connected = false;
    let User;
    
    for (const dbUrl of dbUrls) {
      if (!dbUrl) continue;
      
      try {
        console.log(`🔄 嘗試連接數據庫: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        await mongoose.connect(dbUrl);
        User = require('./models/User');
        connected = true;
        console.log('✅ 數據庫連接成功');
        break;
      } catch (error) {
        console.log(`❌ 連接失敗: ${error.message}`);
        continue;
      }
    }
    
    if (!connected) {
      console.error('❌ 無法連接到任何數據庫');
      return;
    }
    
    // 查找用戶 - 嘗試多種方式
    let user = await User.findOne({ userId: USER_ID });
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
      console.log('❌ 找不到用戶，嘗試列出所有用戶...');
      const allUsers = await User.find({}).limit(10);
      console.log('前10個用戶:', allUsers.map(u => ({
        name: u.name,
        email: u.email,
        userId: u.userId,
        tutorId: u.tutorId
      })));
      return;
    }
    
    console.log('🔍 找到用戶:', {
      name: user.name,
      email: user.email,
      userId: user.userId,
      tutorId: user.tutorId
    });
    
    // 獲取 S3 實際文件
    const s3Files = await getS3Files(USER_ID);
    console.log('📁 S3 文件數量:', s3Files.length);
    s3Files.forEach(file => console.log('  -', file.filename));
    
    // 獲取當前數據庫中的文件
    const currentPublicCerts = user.tutorProfile?.publicCertificates || [];
    const currentEducationCerts = user.documents?.educationCert || [];
    
    console.log('📊 當前 publicCertificates 數量:', currentPublicCerts.length);
    console.log('📊 當前 educationCert 數量:', currentEducationCerts.length);
    
    // 創建 S3 文件 URL 列表
    const s3Urls = s3Files.map(file => file.url);
    
    // 更新兩個字段為 S3 文件列表
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
};

fixUserFiles();