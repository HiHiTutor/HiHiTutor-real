const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');

// GET /api/articles - 取得所有文章
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
    
    // 獲取已審核通過的文章
    const approvedArticles = await Article.find({ status: 'approved' })
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
    const newArticle = new Article({
      title,
      summary,
      content,
      tags: tags || [],
      authorId,
      author: user.name || user.username,
      status: 'pending',
      views: 0,
      featured: false
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

    article.status = 'approved';
    await article.save();
    res.json({ success: true, article });
  } catch (err) {
    console.error('審批文章失敗:', err);
    res.status(500).json({ message: '審批文章失敗' });
  }
});

module.exports = router; 