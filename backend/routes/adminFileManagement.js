const express = require('express');
const router = express.Router();
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

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

// 上傳文件到指定用戶 - 直接更新數據庫
router.post('/users/:userId/files', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileUrls, description } = req.body; // 接收文件 URL 數組
    
    // 檢查用戶是否存在 - 使用 userId 字段而不是 _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: '沒有提供文件 URL'
      });
    }

    // 將文件 URL 添加到用戶的 documents.educationCert 中
    if (!user.documents) {
      user.documents = { idCard: '', educationCert: [] };
    }
    if (!user.documents.educationCert) {
      user.documents.educationCert = [];
    }

    // 添加新文件到 educationCert 數組
    const newFiles = fileUrls.filter(url => !user.documents.educationCert.includes(url));
    user.documents.educationCert.push(...newFiles);

    // 保存用戶記錄
    await user.save();

    const uploadedFiles = newFiles.map(url => {
      const filename = url.split('/').pop();
      return {
        filename: filename,
        url: url,
        size: 0, // 無法獲取實際大小
        uploadDate: new Date(),
        type: path.extname(filename).toLowerCase(),
        description: description || '',
        source: 'educationCert'
      };
    });

    res.json({
      success: true,
      message: `成功添加 ${uploadedFiles.length} 個文件`,
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
