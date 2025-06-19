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
const uploadToS3 = async (req, res) => {
  try {
    if (!req.file) {
      console.log('❌ 沒有接收到檔案');
      return res.status(400).json({ 
        success: false, 
        message: '沒有上傳任何文件' 
      });
    }

    console.log('📁 接收到檔案:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const userId = req.userId || 'unknown';
    const timestamp = Date.now();
    
    console.log('🧾 上傳用戶 userId:', userId);
    
    const key = `uploads/user-docs/${userId}/${timestamp}-${req.file.originalname}`;
    console.log('📁 最終上傳用的檔名 key:', key);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);
    
    // 回傳 S3 的公開 URL
    const url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${key}`;
    
    console.log('✅ S3 上傳成功:', { key, url });
    
    res.json({
      success: true,
      url: url
    });
  } catch (error) {
    console.error('S3 上傳失敗:', error);
    res.status(500).json({
      success: false,
      message: '上傳失敗',
      error: error.message || '未知錯誤'
    });
  }
};

module.exports = {
  upload,
  uploadToS3
}; 