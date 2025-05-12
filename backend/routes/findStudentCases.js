const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');

// GET 查詢學生案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  console.log('👉 Query:', req.query);

  try {
    const query = { isApproved: true };
    if (req.query.featured === 'true') query.featured = true;

    console.log('🔍 Running MongoDB query:', query);

    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    console.log('✅ Query returned', cases.length, 'results');
    res.json(cases);
  } catch (err) {
    console.error('❌ Error in /api/find-student-cases:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('✅ 收到導師個案 POST 請求');
  res.json({ message: '成功收到導師個案 POST 請求', data: req.body });
});

module.exports = router; 