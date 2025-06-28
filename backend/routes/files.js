const express = require('express');
const router = express.Router();
const { getSignedFileUrl } = require('../controllers/fileController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 取得 S3 檔案的簽名 URL - 支持包含路徑的文件名
router.get('/*/signed-url', verifyToken, isAdmin, getSignedFileUrl);

module.exports = router; 