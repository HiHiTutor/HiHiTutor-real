const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
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

// 使用 memoryStorage 避免 Vercel 本地磁碟寫入問題
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
const uploadToS3 = async (file, req) => {
  try {
    const safeFileName = sanitizeFileName(file.originalname);
    const timestamp = Date.now();
    
    // 嘗試從多個來源取得 userId
    let userId = 'unknown';
    
    // 1. 優先從 req.user.userId 取得
    if (req.user?.userId) {
      userId = req.user.userId;
    }
    // 2. 如果 req.user.userId 不存在，嘗試從 JWT token 解析
    else if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const jwtSecret = process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET;
          if (!jwtSecret) {
            console.log('⚠️ JWT_SECRET 環境變數未設定，使用 unknown 用戶');
          } else {
            const decoded = jwt.verify(token, jwtSecret);
            if (decoded?.userId) {
              userId = decoded.userId;
              console.log('✅ 成功從 JWT token 解析到 userId:', userId);
            } else {
              console.log('⚠️ JWT token 中沒有 userId，使用 unknown 用戶');
            }
          }
        }
      } catch (jwtError) {
        console.log('⚠️ JWT token 解析失敗，使用 unknown 用戶:', jwtError.message);
      }
    }
    
    console.log('🧾 上傳用戶 userId:', userId);
    
    const key = `uploads/user-docs/${userId}/${timestamp}-${safeFileName}`;
    console.log('📁 最終上傳用的檔名 key:', key);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await s3Client.send(command);
    
    // 回傳 S3 的公開 URL
    const url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${key}`;
    return { key, url };
  } catch (error) {
    console.error('S3 上傳失敗:', error);
    throw new Error(`S3 上傳失敗: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadToS3
}; 