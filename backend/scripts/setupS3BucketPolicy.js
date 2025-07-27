const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

// 從環境變數獲取配置
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hihitutor-uploads';
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// S3 存儲桶策略，允許公開讀取所有對象
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
    }
  ]
};

async function setupBucketPolicy() {
  try {
    console.log('🔧 設置 S3 存儲桶策略...');
    console.log('📦 存儲桶名稱:', BUCKET_NAME);
    console.log('🌍 地區:', AWS_REGION);

    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });

    await s3Client.send(command);
    
    console.log('✅ S3 存儲桶策略設置成功！');
    console.log('📋 策略內容:');
    console.log(JSON.stringify(bucketPolicy, null, 2));
    
  } catch (error) {
    console.error('❌ 設置 S3 存儲桶策略失敗:', error);
    
    if (error.Code === 'AccessDenied') {
      console.log('💡 提示: 請確保 AWS 憑證有足夠權限設置存儲桶策略');
    }
    
    throw error;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setupBucketPolicy()
    .then(() => {
      console.log('🎉 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { setupBucketPolicy }; 