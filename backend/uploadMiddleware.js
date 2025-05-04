const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 優先使用 JWT 中的用戶 ID
    const userId = req.user?.id || req.body.userId || 'unknown';
    console.log('[📁] 上傳檔案 - 用戶ID:', userId);
    
    const uploadPath = path.join(__dirname, 'public/uploads', userId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 處理檔案名稱
    const safeFileName = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}-${safeFileName}`;
    console.log('[📁] 上傳檔案 - 新檔名:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
});

module.exports = upload; 