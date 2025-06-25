const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { BUCKET_NAME } = require('../config/s3');

const s3 = new S3Client({ region: 'ap-southeast-2' });

exports.getSignedFileUrl = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // 解碼 filename，處理中文路徑和空格
    const decodedKey = decodeURIComponent(filename);
    
    console.log('🔍 簽名URL請求:', {
      originalFilename: filename,
      decodedKey: decodedKey,
      bucket: BUCKET_NAME
    });
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: decodedKey
    });
    
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5分鐘有效
    
    console.log('✅ 簽名URL生成成功:', {
      key: decodedKey,
      url: url.substring(0, 50) + '...'
    });
    
    res.json({ url });
  } catch (err) {
    console.error('❌ 生成簽名URL失敗:', err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}; 