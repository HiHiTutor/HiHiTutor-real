const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { BUCKET_NAME } = require('../config/s3');

const s3 = new S3Client({ region: 'ap-southeast-2' });

exports.getSignedFileUrl = async (req, res) => {
  try {
    const { filename } = req.params;
    // 你可以根據實際情況調整 Key 路徑
    const key = `uploads/user-docs/${filename}`;
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5分鐘有效
    res.json({ url });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}; 