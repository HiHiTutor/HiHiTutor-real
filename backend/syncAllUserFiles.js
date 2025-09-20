// 統一所有用戶文件的腳本
// 按後台資料統一前台及S3文件

const mongoose = require('mongoose');
const { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// S3 配置
const s3Client = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAX7VQZQZQZQZQZQZQ',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key'
  }
});

const BUCKET_NAME = 'hihitutor-uploads';

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

// 同步單個用戶的文件
const syncUserFiles = async (userId) => {
  try {
    const User = require('./models/User');
    
    // 查找用戶
    const user = await User.findOne({ userId: userId });
    if (!user) {
      console.log('❌ 用戶不存在:', userId);
      return { success: false, message: '用戶不存在' };
    }
    
    console.log('🔍 同步用戶:', user.name, '(ID:', userId, ')');
    
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
    
    console.log('✅ 同步完成!');
    console.log('📊 更新後 publicCertificates 數量:', updatedUser.tutorProfile.publicCertificates.length);
    console.log('📊 更新後 educationCert 數量:', updatedUser.documents.educationCert.length);
    
    return {
      success: true,
      message: '文件同步成功',
      data: {
        userId: updatedUser.userId,
        s3Files: s3Files.length,
        publicCertificates: updatedUser.tutorProfile.publicCertificates.length,
        educationCert: updatedUser.documents.educationCert.length
      }
    };
  } catch (error) {
    console.error('❌ 同步用戶文件失敗:', error);
    return { success: false, message: error.message };
  }
};

// 同步所有導師用戶的文件
const syncAllTutorFiles = async () => {
  try {
    const User = require('./models/User');
    
    // 查找所有導師用戶
    const tutors = await User.find({ 
      userType: 'tutor',
      'tutorProfile.publicCertificates': { $exists: true }
    }).select('userId name');
    
    console.log('🔍 找到導師用戶數量:', tutors.length);
    
    const results = [];
    
    for (const tutor of tutors) {
      console.log(`\n📝 處理用戶: ${tutor.name} (${tutor.userId})`);
      const result = await syncUserFiles(tutor.userId);
      results.push({
        userId: tutor.userId,
        name: tutor.name,
        ...result
      });
    }
    
    console.log('\n🎉 所有用戶文件同步完成!');
    console.log('📊 同步結果:');
    results.forEach(result => {
      console.log(`  ${result.name} (${result.userId}): ${result.success ? '✅' : '❌'} ${result.message}`);
    });
    
    return results;
  } catch (error) {
    console.error('❌ 同步所有用戶文件失敗:', error);
    return { success: false, message: error.message };
  }
};

// 主函數
const main = async () => {
  const userId = process.argv[2];
  
  try {
    console.log('🔗 連接到 MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB 連接成功');
    
    if (userId) {
      // 同步單個用戶
      console.log(`🔧 同步用戶: ${userId}`);
      const result = await syncUserFiles(userId);
      console.log('結果:', result);
    } else {
      // 同步所有導師用戶
      console.log('🔧 同步所有導師用戶文件...');
      const results = await syncAllTutorFiles();
      console.log('結果:', results);
    }
    
  } catch (error) {
    console.error('❌ 執行失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
    process.exit(0);
  }
};

main();
