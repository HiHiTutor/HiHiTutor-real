const express = require('express');
const router = express.Router();
const upload = require('../uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');

// POST /api/upload
router.post('/', verifyToken, (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer 錯誤處理
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '檔案大小超過限制（最大 5MB）'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: '上傳檔案數量超過限制（最多 5 個）'
        });
      }
      return res.status(400).json({
        success: false,
        message: `檔案上傳錯誤：${err.message}`
      });
    } else if (err) {
      // 其他錯誤處理
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, (req, res) => {
  try {
    const uploadedFiles = req.files;
    const userId = req.user.id;
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '沒有上傳任何文件' 
      });
    }

    // 回傳所有檔案的資訊
    res.json({
      success: true,
      files: uploadedFiles.map(f => ({
        filename: f.filename,
        url: `/uploads/${userId}/${f.filename}`
      }))
    });
  } catch (err) {
    console.error('文件上傳失敗:', err);
    res.status(500).json({ 
      success: false, 
      message: '文件上傳失敗' 
    });
  }
});

module.exports = router; 