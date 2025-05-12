const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');

// GET 查詢導師案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-tutor-cases');
  console.log('👉 Query:', req.query);

  try {
    const query = { isApproved: true };
    if (req.query.featured === 'true') query.featured = true;

    console.log('🔍 Running MongoDB query:', query);

    const cases = await TutorCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    console.log('✅ Query returned', cases.length, 'results');
    res.json(cases);
  } catch (err) {
    console.error('❌ Error in /api/find-tutor-cases:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('收到 /api/find-tutor-cases POST 請求');
  res.json({ message: '收到學生個案 POST' });
});

module.exports = router; 