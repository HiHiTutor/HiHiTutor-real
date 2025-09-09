const express = require('express');
const router = express.Router();
const { upload, deleteFile, getFileUrl } = require('../services/s3Service');
const Article = require('../models/Article');

// 上傳文章封面圖片
router.post('/cover-image', upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: '沒有上傳文件' 
      });
    }

    const { articleId } = req.body;
    
    if (!articleId) {
      // 如果沒有文章ID，返回臨時URL
      return res.json({
        success: true,
        url: req.file.location,
        key: req.file.key,
        message: '圖片上傳成功，請先保存文章'
      });
    }

    // 更新文章記錄
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }

    // 刪除舊的封面圖片（如果存在）
    if (article.coverImage && article.coverImage !== req.file.location) {
      const oldKey = article.coverImage.split('/').slice(-2).join('/');
      await deleteFile(`articles/${articleId}/${oldKey}`);
    }

    // 更新文章封面圖片
    article.coverImage = req.file.location;
    await article.save();

    res.json({
      success: true,
      url: req.file.location,
      key: req.file.key,
      message: '封面圖片上傳成功'
    });

  } catch (error) {
    console.error('上傳文章封面圖片失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '上傳失敗' 
    });
  }
});

// 刪除文章封面圖片
router.delete('/cover-image/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }

    if (article.coverImage) {
      // 從 S3 刪除文件
      const fileKey = article.coverImage.split('/').slice(-2).join('/');
      await deleteFile(`articles/${articleId}/${fileKey}`);
      
      // 清除文章記錄中的圖片URL
      article.coverImage = null;
      await article.save();
    }

    res.json({
      success: true,
      message: '封面圖片已刪除'
    });

  } catch (error) {
    console.error('刪除文章封面圖片失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '刪除失敗' 
    });
  }
});

// 獲取文章圖片URL
router.get('/cover-image/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }

    res.json({
      success: true,
      url: article.coverImage || null,
      message: article.coverImage ? '獲取成功' : '文章沒有封面圖片'
    });

  } catch (error) {
    console.error('獲取文章封面圖片失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取失敗' 
    });
  }
});

module.exports = router;
