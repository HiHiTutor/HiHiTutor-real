const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');

// GET 查詢導師案例
router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    let query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }

    const cases = await TutorCase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 0);

    res.json({
      success: true,
      data: {
        cases,
        total: cases.length
      },
      message: '成功獲取導師案例列表'
    });
  } catch (error) {
    console.error('Error fetching tutor cases:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師案例時發生錯誤'
    });
  }
});

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('收到 /api/find-tutor-cases POST 請求');
  res.json({ message: '收到學生個案 POST' });
});

module.exports = router; 