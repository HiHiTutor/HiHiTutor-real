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

// 確保上傳目錄存在
const ensureUploadDir = (userId) => {
  const uploadPath = path.join(__dirname, 'public/uploads', userId);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // 優先使用 JWT 中的用戶 ID
      const userId = req.user?.id || 'unknown';
      console.log('[📁] 上傳檔案 - 用戶ID:', userId);
      
      const uploadPath = ensureUploadDir(userId);
      cb(null, uploadPath);
    } catch (error) {
      console.error('[❌] 創建上傳目錄失敗:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // 處理檔案名稱
      const safeFileName = sanitizeFileName(file.originalname);
      const uniqueName = `${Date.now()}-${safeFileName}`;
      console.log('[📁] 上傳檔案 - 新檔名:', uniqueName);
      cb(null, uniqueName);
    } catch (error) {
      console.error('[❌] 處理檔案名稱失敗:', error);
      cb(error);
    }
  }
});

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

module.exports = upload; 