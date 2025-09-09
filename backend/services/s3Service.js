const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// 檢查 S3 環境變數
const hasS3Config = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;

if (!hasS3Config) {
  console.warn('⚠️ S3 環境變數未配置，將使用本地文件存儲');
}

// 配置 AWS S3
const s3 = hasS3Config ? new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
}) : null;

// 配置 multer 用於文件上傳
const upload = multer({
  storage: hasS3Config ? multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET || 'hihitutor-articles',
    acl: 'public-read',
    key: function (req, file, cb) {
      // 根據文章ID創建文件路徑
      const articleId = req.body.articleId || req.params.articleId || 'temp';
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `articles/${articleId}/${timestamp}${extension}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        articleId: req.body.articleId || req.params.articleId || 'temp'
      });
    }
  }) : multer.diskStorage({
    destination: function (req, file, cb) {
      const articleId = req.body.articleId || req.params.articleId || 'temp';
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'articles', articleId);
      require('fs').mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}${extension}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
  fileFilter: function (req, file, cb) {
    // 只允許圖片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片文件'), false);
    }
  }
});

// 刪除 S3 文件
const deleteFile = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'hihitutor-articles',
      Key: fileKey
    };
    
    await s3.deleteObject(params).promise();
    console.log(`✅ S3 文件已刪除: ${fileKey}`);
    return true;
  } catch (error) {
    console.error('❌ 刪除 S3 文件失敗:', error);
    return false;
  }
};

// 獲取文件 URL
const getFileUrl = (fileKey) => {
  if (!fileKey) return null;
  
  // 如果已經是完整的 URL，直接返回
  if (fileKey.startsWith('http')) {
    return fileKey;
  }
  
  // 如果有 S3 配置，構建 S3 URL
  if (hasS3Config) {
    const bucket = process.env.AWS_S3_BUCKET || 'hihitutor-articles';
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
  }
  
  // 否則構建本地文件 URL
  return `/uploads/${fileKey}`;
};

module.exports = {
  upload,
  deleteFile,
  getFileUrl,
  s3
};
