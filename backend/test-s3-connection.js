const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function testS3Connection() {
  console.log('🔍 測試 S3 連接...');
  console.log('🔍 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ 已設置' : '❌ 未設置');
  console.log('🔍 AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ 已設置' : '❌ 未設置');
  console.log('🔍 AWS_REGION:', process.env.AWS_REGION || 'ap-southeast-2');
  console.log('🔍 AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'hihitutor-uploads');

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ S3 連接成功！');
    console.log('📦 可用的 Buckets:', response.Buckets.map(b => b.Name));
    
    const targetBucket = process.env.AWS_S3_BUCKET_NAME || 'hihitutor-uploads';
    const bucketExists = response.Buckets.some(b => b.Name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ 目標 Bucket "${targetBucket}" 存在`);
    } else {
      console.log(`❌ 目標 Bucket "${targetBucket}" 不存在`);
    }
    
  } catch (error) {
    console.error('❌ S3 連接失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

testS3Connection(); 