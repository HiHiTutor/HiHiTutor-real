const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const ARTICLES_FILE = path.join(__dirname, '../data/articles.json');

async function loadArticles() {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveArticles(articles) {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

// GET /api/articles - 取得所有文章
router.get('/', async (req, res) => {
  try {
    const articles = await loadArticles();
    const approvedArticles = articles.filter(a => a.status === 'approved');
    res.json(approvedArticles);
  } catch (err) {
    res.status(500).json({ message: '載入文章失敗' });
  }
});

// 根據 ID 取得單篇文章
router.get('/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const article = data.find((a) => a.id === req.params.id);
  if (article) return res.json(article);
  res.status(404).json({ message: '找不到文章' });
});

// 投稿（導師付費才能用）
router.post('/submit', async (req, res) => {
  try {
    const { title, summary, content, tags, authorId } = req.body;
    if (!title || !summary || !content || !authorId) {
      return res.status(400).json({ message: '缺少必要欄位' });
    }

    const articles = await loadArticles();
    const newArticle = {
      id: Date.now().toString(),
      title,
      summary,
      content,
      tags: tags || [],
      authorId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      views: 0,
      featured: false
    };

    articles.push(newArticle);
    await saveArticles(articles);
    res.json({ success: true, article: newArticle });
  } catch (err) {
    res.status(500).json({ message: '提交文章失敗' });
  }
});

// 審批文章（需要 admin 權限）
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = await loadArticles();
    const article = articles.find(a => a.id === id);

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    article.status = 'approved';
    await saveArticles(articles);
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ message: '審批文章失敗' });
  }
});

module.exports = router; 