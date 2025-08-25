const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');

// GET /api/articles - 取得所有文章（公開）
router.get('/', async (req, res) => {
  try {
    // 檢查是否有用戶認證
    const authHeader = req.headers.authorization;
    let userArticles = [];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // 這裡應該驗證 token 並獲取用戶信息
        // 暫時簡單處理，實際應該使用 JWT 驗證
        const token = authHeader.substring(7);
        // TODO: 驗證 token 並獲取用戶 ID
        
        // 獲取用戶自己的文章（包括待審核的）
        // userArticles = await Article.find({ authorId: userId });
      } catch (err) {
        console.log('Token 驗證失敗:', err.message);
      }
    }
    
    // 獲取已審核通過的文章（不包括已歸檔的）
    const approvedArticles = await Article.find({ 
      status: 'approved',
      isEdit: { $ne: true } // 排除編輯中的文章
    })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 });
    
    // 合併用戶自己的文章和已審核的文章
    const allArticles = [...userArticles, ...approvedArticles];
    
    res.json(approvedArticles); // 暫時只返回已審核的文章
  } catch (err) {
    console.error('載入文章失敗:', err);
    res.status(500).json({ message: '載入文章失敗' });
  }
});

// GET /api/articles/all - 管理員獲取所有文章（包括待審核的）
router.get('/all', async (req, res) => {
  try {
    // TODO: 驗證管理員權限
    const articles = await Article.find()
      .populate('authorId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(articles);
  } catch (err) {
    console.error('載入所有文章失敗:', err);
    res.status(500).json({ message: '載入所有文章失敗' });
  }
});

// 獲取用戶自己的文章（包括待審核的）
router.get('/my-articles', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '需要認證' });
    }
    
    // TODO: 驗證 token 並獲取用戶 ID
    // 暫時從 query 參數獲取
    const { authorId } = req.query;
    if (!authorId) {
      return res.status(400).json({ message: '缺少 authorId 參數' });
    }
    
    const articles = await Article.find({ authorId })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(articles);
  } catch (err) {
    console.error('載入用戶文章失敗:', err);
    res.status(500).json({ message: '載入用戶文章失敗' });
  }
});

// 根據 ID 取得單篇文章
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('authorId', 'name');
    if (article) return res.json(article);
    res.status(404).json({ message: '找不到文章' });
  } catch (err) {
    console.error('載入文章失敗:', err);
    res.status(500).json({ message: '載入文章失敗' });
  }
});

// 投稿（導師付費才能用）
router.post('/submit', async (req, res) => {
  try {
    console.log('📝 開始處理文章投稿請求');
    
    const { title, summary, content, tags, authorId } = req.body;
    if (!title || !summary || !content || !authorId) {
      console.log('❌ 缺少必要欄位:', { title: !!title, summary: !!summary, content: !!content, authorId: !!authorId });
      return res.status(400).json({ message: '缺少必要欄位' });
    }

    // 驗證用戶是否存在且是導師
    const user = await User.findById(authorId);
    if (!user) {
      console.log('❌ 用戶不存在:', authorId);
      return res.status(404).json({ message: '用戶不存在' });
    }

    if (user.userType !== 'tutor') {
      console.log('❌ 用戶不是導師:', user.userType);
      return res.status(403).json({ message: '只有導師可以投稿文章' });
    }

    console.log('📝 創建新文章...');
    
    // 檢查是否是編輯的文章
    const isEdit = req.body.originalArticleId ? true : false;
    const originalArticleId = req.body.originalArticleId || null;
    
    const newArticle = new Article({
      title,
      summary,
      content,
      tags: tags || [],
      authorId,
      author: user.name || user.username,
      status: 'pending',
      views: 0,
      featured: false,
      originalArticleId,
      isEdit
    });

    console.log('📝 保存文章到數據庫...');
    await newArticle.save();
    
    console.log('✅ 文章投稿成功');
    res.json({ success: true, article: newArticle });
  } catch (err) {
    console.error('❌ 文章投稿失敗:', err);
    res.status(500).json({ message: '提交文章失敗', error: err.message });
  }
});

// 審批文章（需要 admin 權限）
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    // 如果是編輯的文章，需要處理舊文章
    if (article.originalArticleId && article.isEdit) {
      console.log('📝 審批編輯文章，處理舊文章替換...');
      
      try {
        // 找到舊文章
        const oldArticle = await Article.findById(article.originalArticleId);
        if (oldArticle) {
          // 將舊文章設為 archived 狀態
          oldArticle.status = 'archived';
          await oldArticle.save();
          console.log('📝 舊文章已設為 archived:', oldArticle._id);
        }
        
        // 更新新文章，移除編輯標記
        article.originalArticleId = null;
        article.isEdit = false;
        article.status = 'approved';
        await article.save();
        
        console.log('✅ 編輯文章審批成功，已取代舊文章');
        res.json({ 
          success: true, 
          article,
          message: '編輯文章審批成功，已取代舊文章'
        });
        return;
      } catch (replaceError) {
        console.error('❌ 處理舊文章替換失敗:', replaceError);
        // 即使替換失敗，也要審批通過新文章
      }
    }

    // 普通文章審批
    article.status = 'approved';
    await article.save();
    res.json({ success: true, article });
  } catch (err) {
    console.error('審批文章失敗:', err);
    res.status(500).json({ message: '審批文章失敗' });
  }
});

// 拒絕文章（需要 admin 權限）
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: '請提供拒絕原因' });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    article.status = 'rejected';
    // 可以在這裡添加拒絕原因字段，如果 Article 模型支持的話
    await article.save();
    
    res.json({ success: true, article });
  } catch (err) {
    console.error('拒絕文章失敗:', err);
    res.status(500).json({ message: '拒絕文章失敗' });
  }
});

module.exports = router; 