const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { uploadToS3 } = require('../uploadMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 自訂 middleware，解 JWT token，提取 userId
function extractUserId(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET;
      if (!jwtSecret) {
        console.log('⚠️ JWT_SECRET 環境變數未設定，使用 unknown 用戶');
        req.userId = 'unknown';
      } else {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId || 'unknown';
        console.log('✅ 成功從 JWT token 解析到 userId:', req.userId);
      }
    } catch (error) {
      console.log('⚠️ JWT token 解析失敗，使用 unknown 用戶:', error.message);
      req.userId = 'unknown';
    }
  } else {
    console.log('⚠️ 沒有 Authorization header，使用 unknown 用戶');
    req.userId = 'unknown';
  }
  next();
}

// POST /api/upload
router.post('/', extractUserId, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 開始處理檔案上傳請求');
    
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

    // 上傳檔案到 S3
    console.log('☁️ 開始上傳到 S3...');
    await uploadToS3(req, res);
    
  } catch (err) {
    console.error('🛑 上傳失敗詳情：', err);
    res.status(500).json({
      success: false,
      message: '上傳失敗',
      error: err.message || '未知錯誤'
    });
  }
});

module.exports = router; 