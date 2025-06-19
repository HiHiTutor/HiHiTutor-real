const { S3Client } = require('@aws-sdk/client-s3');

// Debug AWS 環境變數
console.log('🔍 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('🔍 AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '[HIDDEN]' : '❌ MISSING');
console.log('🔍 AWS_REGION:', process.env.AWS_REGION);
console.log('🔍 S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'hihitutor-uploads';

module.exports = {
  s3Client,
  BUCKET_NAME
}; 