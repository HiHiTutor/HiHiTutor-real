const express = require('express');
const router = express.Router();
const upload = require('../uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/upload
router.post('/', verifyToken, upload.array('files'), (req, res) => {
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
        filename: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        buffer: f.buffer.toString('base64')
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