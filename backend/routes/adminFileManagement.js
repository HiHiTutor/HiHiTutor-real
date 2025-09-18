const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 配置 multer 用於文件上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.params.userId;
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'users', userId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
  fileFilter: function (req, file, cb) {
    // 允許常見的文件類型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件類型'), false);
    }
  }
});

// 獲取用戶文件列表
router.get('/users/:userId/files', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 檢查用戶是否存在 - 使用 userId 字段而不是 _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    let files = [];
    const fileMap = new Map(); // 使用 Map 來避免重複文件
    
    // 從用戶的 tutorProfile.publicCertificates 獲取文件
    if (user.tutorProfile && user.tutorProfile.publicCertificates) {
      user.tutorProfile.publicCertificates.forEach((url, index) => {
        const filename = url.split('/').pop(); // 從 URL 中提取文件名
        if (!fileMap.has(filename)) {
          fileMap.set(filename, {
            filename: filename,
            url: url,
            size: 0, // S3 文件大小需要額外 API 調用獲取
            uploadDate: new Date(), // 使用當前時間作為默認值
            type: path.extname(filename).toLowerCase(),
            sources: ['publicCertificates']
          });
        } else {
          // 如果文件已存在，添加來源
          fileMap.get(filename).sources.push('publicCertificates');
        }
      });
    }
    
    // 從用戶的 documents.educationCert 獲取文件
    if (user.documents && user.documents.educationCert) {
      user.documents.educationCert.forEach((url, index) => {
        const filename = url.split('/').pop(); // 從 URL 中提取文件名
        if (!fileMap.has(filename)) {
          fileMap.set(filename, {
            filename: filename,
            url: url,
            size: 0, // S3 文件大小需要額外 API 調用獲取
            uploadDate: new Date(), // 使用當前時間作為默認值
            type: path.extname(filename).toLowerCase(),
            sources: ['educationCert']
          });
        } else {
          // 如果文件已存在，添加來源
          fileMap.get(filename).sources.push('educationCert');
        }
      });
    }
    
    // 將 Map 轉換為數組
    files = Array.from(fileMap.values());

    res.json({
      success: true,
      data: {
        userId,
        userName: user.name,
        files
      }
    });
  } catch (error) {
    console.error('獲取用戶文件列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取文件列表失敗',
      error: error.message
    });
  }
});

// 上傳文件到指定用戶
router.post('/users/:userId/files', verifyToken, isAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const { userId } = req.params;
    const { description } = req.body;
    
    // 檢查用戶是否存在 - 使用 userId 字段而不是 _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '沒有上傳文件'
      });
    }

    // 處理上傳的文件
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/users/${userId}/${file.filename}`,
      size: file.size,
      type: path.extname(file.filename).toLowerCase(),
      uploadDate: new Date(),
      description: description || ''
    }));

    // 更新用戶的組織文件記錄（如果用戶是機構）
    if (user.userType === 'organization' && user.organizationProfile) {
      if (!user.organizationProfile.documents) {
        user.organizationProfile.documents = [];
      }
      
      uploadedFiles.forEach(file => {
        user.organizationProfile.documents.push({
          type: 'admin_uploaded',
          url: file.url,
          filename: file.filename,
          originalName: file.originalName,
          description: file.description,
          uploadDate: file.uploadDate
        });
      });
      
      await user.save();
    }

    res.json({
      success: true,
      message: '文件上傳成功',
      data: {
        userId,
        userName: user.name,
        uploadedFiles
      }
    });
  } catch (error) {
    console.error('上傳文件失敗:', error);
    res.status(500).json({
      success: false,
      message: '上傳文件失敗',
      error: error.message
    });
  }
});

// 刪除用戶文件
router.delete('/users/:userId/files/:filename', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, filename } = req.params;
    
    // 檢查用戶是否存在 - 使用 userId 字段而不是 _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    let fileFound = false;
    let updated = false;

    // 從 tutorProfile.publicCertificates 中移除文件
    if (user.tutorProfile && user.tutorProfile.publicCertificates) {
      const originalLength = user.tutorProfile.publicCertificates.length;
      user.tutorProfile.publicCertificates = user.tutorProfile.publicCertificates.filter(url => {
        const urlFilename = url.split('/').pop();
        return urlFilename !== filename;
      });
      if (user.tutorProfile.publicCertificates.length < originalLength) {
        fileFound = true;
        updated = true;
      }
    }

    // 從 documents.educationCert 中移除文件
    if (user.documents && user.documents.educationCert) {
      const originalLength = user.documents.educationCert.length;
      user.documents.educationCert = user.documents.educationCert.filter(url => {
        const urlFilename = url.split('/').pop();
        return urlFilename !== filename;
      });
      if (user.documents.educationCert.length < originalLength) {
        fileFound = true;
        updated = true;
      }
    }

    if (!fileFound) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 保存更新後的用戶記錄
    if (updated) {
      await user.save();
    }

    res.json({
      success: true,
      message: '文件刪除成功',
      data: {
        userId,
        userName: user.name,
        deletedFile: filename
      }
    });
  } catch (error) {
    console.error('刪除文件失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除文件失敗',
      error: error.message
    });
  }
});

// 批量刪除用戶文件
router.delete('/users/:userId/files', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { filenames } = req.body;
    
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: '請提供要刪除的文件列表'
      });
    }
    
    // 檢查用戶是否存在 - 使用 userId 字段而不是 _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    const deletedFiles = [];
    const failedFiles = [];
    let updated = false;

    for (const filename of filenames) {
      try {
        let fileFound = false;

        // 從 tutorProfile.publicCertificates 中移除文件
        if (user.tutorProfile && user.tutorProfile.publicCertificates) {
          const originalLength = user.tutorProfile.publicCertificates.length;
          user.tutorProfile.publicCertificates = user.tutorProfile.publicCertificates.filter(url => {
            const urlFilename = url.split('/').pop();
            return urlFilename !== filename;
          });
          if (user.tutorProfile.publicCertificates.length < originalLength) {
            fileFound = true;
            updated = true;
          }
        }

        // 從 documents.educationCert 中移除文件
        if (user.documents && user.documents.educationCert) {
          const originalLength = user.documents.educationCert.length;
          user.documents.educationCert = user.documents.educationCert.filter(url => {
            const urlFilename = url.split('/').pop();
            return urlFilename !== filename;
          });
          if (user.documents.educationCert.length < originalLength) {
            fileFound = true;
            updated = true;
          }
        }

        if (fileFound) {
          deletedFiles.push(filename);
        } else {
          failedFiles.push({ filename, reason: '文件不存在' });
        }
      } catch (error) {
        failedFiles.push({ filename, reason: error.message });
      }
    }

    // 保存更新後的用戶記錄
    if (updated) {
      await user.save();
    }

    res.json({
      success: true,
      message: `成功刪除 ${deletedFiles.length} 個文件`,
      data: {
        userId,
        userName: user.name,
        deletedFiles,
        failedFiles
      }
    });
  } catch (error) {
    console.error('批量刪除文件失敗:', error);
    res.status(500).json({
      success: false,
      message: '批量刪除文件失敗',
      error: error.message
    });
  }
});

module.exports = router;
