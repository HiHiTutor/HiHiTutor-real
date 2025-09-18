const express = require('express');
const router = express.Router();
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { upload, uploadToS3 } = require('../uploadMiddleware');

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

// 上傳文件到指定用戶 - 使用 S3 上傳
router.post('/users/:userId/files', verifyToken, isAdmin, upload.single('file'), async (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '沒有上傳文件'
      });
    }

    // 設置用戶 ID 到請求中，供 uploadToS3 使用
    req.userId = userId;

    // 直接處理 S3 上傳
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const { s3Client, BUCKET_NAME } = require('../config/s3');
    
    const timestamp = Date.now();
    const filename = req.file.originalname;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_');
    const key = `uploads/user-docs/${userId}/${timestamp}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);
    
    // 生成 S3 URL
    const url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${key}`;
    
    // 將文件 URL 添加到用戶的多個字段中，確保前台能正確顯示
    let updated = false;

    // 添加到 documents.educationCert
    if (!user.documents) {
      user.documents = { idCard: '', educationCert: [] };
    }
    if (!user.documents.educationCert) {
      user.documents.educationCert = [];
    }
    if (!user.documents.educationCert.includes(url)) {
      user.documents.educationCert.push(url);
      updated = true;
    }

    // 添加到 tutorProfile.publicCertificates（如果是導師）
    if (user.userType === 'tutor' && user.tutorProfile) {
      if (!user.tutorProfile.publicCertificates) {
        user.tutorProfile.publicCertificates = [];
      }
      if (!user.tutorProfile.publicCertificates.includes(url)) {
        user.tutorProfile.publicCertificates.push(url);
        updated = true;
      }
    }

    // 檢查文件是否已存在
    if (updated) {
      await user.save();

      const uploadedFile = {
        filename: sanitizedFilename,
        url: url,
        size: req.file.size,
        uploadDate: new Date(),
        type: path.extname(filename).toLowerCase(),
        description: description || '',
        source: 'educationCert'
      };

      res.json({
        success: true,
        message: '文件上傳成功',
        data: {
          userId,
          userName: user.name,
          uploadedFile
        }
      });
    } else {
      res.json({
        success: false,
        message: '文件已存在'
      });
    }
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
    let fileUrl = '';

    // 從 tutorProfile.publicCertificates 中移除文件
    if (user.tutorProfile && user.tutorProfile.publicCertificates) {
      const originalLength = user.tutorProfile.publicCertificates.length;
      user.tutorProfile.publicCertificates = user.tutorProfile.publicCertificates.filter(url => {
        const urlFilename = url.split('/').pop();
        if (urlFilename === filename) {
          fileUrl = url;
          return false; // 移除這個文件
        }
        return true;
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
        if (urlFilename === filename) {
          fileUrl = url;
          return false; // 移除這個文件
        }
        return true;
      });
      if (user.documents.educationCert.length < originalLength) {
        fileFound = true;
        updated = true;
      }
    }

    // 從 organizationProfile.documents 中移除文件
    if (user.organizationProfile && user.organizationProfile.documents) {
      const originalLength = user.organizationProfile.documents.length;
      user.organizationProfile.documents = user.organizationProfile.documents.filter(doc => {
        const urlFilename = doc.url ? doc.url.split('/').pop() : '';
        if (urlFilename === filename) {
          fileUrl = doc.url;
          return false; // 移除這個文件
        }
        return true;
      });
      if (user.organizationProfile.documents.length < originalLength) {
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

    // 從 S3 中刪除文件
    if (fileUrl) {
      try {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const { s3Client, BUCKET_NAME } = require('../config/s3');
        
        // 從 URL 中提取 S3 key
        const urlParts = fileUrl.split('/');
        const key = urlParts.slice(3).join('/'); // 移除 https://bucket.s3.region.amazonaws.com/ 部分
        
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key
        });
        
        await s3Client.send(deleteCommand);
        console.log('✅ S3 文件刪除成功:', key);
      } catch (s3Error) {
        console.error('❌ S3 文件刪除失敗:', s3Error);
        // 不影響數據庫刪除，只記錄錯誤
      }
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
        let fileUrl = '';

        // 從 tutorProfile.publicCertificates 中移除文件
        if (user.tutorProfile && user.tutorProfile.publicCertificates) {
          const originalLength = user.tutorProfile.publicCertificates.length;
          user.tutorProfile.publicCertificates = user.tutorProfile.publicCertificates.filter(url => {
            const urlFilename = url.split('/').pop();
            if (urlFilename === filename) {
              fileUrl = url;
              return false; // 移除這個文件
            }
            return true;
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
            if (urlFilename === filename) {
              fileUrl = url;
              return false; // 移除這個文件
            }
            return true;
          });
          if (user.documents.educationCert.length < originalLength) {
            fileFound = true;
            updated = true;
          }
        }

        // 從 organizationProfile.documents 中移除文件
        if (user.organizationProfile && user.organizationProfile.documents) {
          const originalLength = user.organizationProfile.documents.length;
          user.organizationProfile.documents = user.organizationProfile.documents.filter(doc => {
            const urlFilename = doc.url ? doc.url.split('/').pop() : '';
            if (urlFilename === filename) {
              fileUrl = doc.url;
              return false; // 移除這個文件
            }
            return true;
          });
          if (user.organizationProfile.documents.length < originalLength) {
            fileFound = true;
            updated = true;
          }
        }

        if (fileFound) {
          deletedFiles.push(filename);
          
          // 從 S3 中刪除文件
          if (fileUrl) {
            try {
              const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
              const { s3Client, BUCKET_NAME } = require('../config/s3');
              
              // 從 URL 中提取 S3 key
              const urlParts = fileUrl.split('/');
              const key = urlParts.slice(3).join('/'); // 移除 https://bucket.s3.region.amazonaws.com/ 部分
              
              const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key
              });
              
              await s3Client.send(deleteCommand);
              console.log('✅ S3 文件刪除成功:', key);
            } catch (s3Error) {
              console.error('❌ S3 文件刪除失敗:', s3Error);
              // 不影響數據庫刪除，只記錄錯誤
            }
          }
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
