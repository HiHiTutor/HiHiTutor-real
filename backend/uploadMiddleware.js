const multer = require('multer');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET_NAME } = require('./config/s3');

// 處理檔案名稱，移除特殊字元
const sanitizeFileName = (fileName) => {
  // 取得副檔名
  const ext = path.extname(fileName);
  // 移除副檔名，只保留檔名
  const nameWithoutExt = path.basename(fileName, ext);
  // 將檔名轉換為安全的字串（移除特殊字元，保留中文）
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  // 組合新的檔名
  return `${safeName}${ext}`;
};

// 使用 memoryStorage
const storage = multer.memoryStorage();

// 檔案過濾器
const fileFilter = (req, file, cb) => {
  // 允許的檔案類型
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支援的檔案類型。只允許 PDF、JPEG 和 PNG 檔案。'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
    files: 5 // 最多 5 個檔案
  }
});

// 上傳到 S3 的函數
const uploadToS3 = async (file, userId) => {
  const safeFileName = sanitizeFileName(file.originalname);
  const key = `${userId}/${Date.now()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3Client.send(command);
  return key;
};

module.exports = {
  upload,
  uploadToS3
}; 