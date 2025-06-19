const express = require('express');
const router = express.Router();
const { upload, uploadToS3 } = require('../uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/upload
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
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
    const result = await uploadToS3(req.file, req);
    
    console.log('✅ S3 上傳成功:', result);

    // 回傳成功響應
    res.json({
      success: true,
      url: result.url
    });
    
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