const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');

// GET /api/articles - 取得所有文章
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('載入文章失敗:', err);
    res.status(500).json({ message: '載入文章失敗' });
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