const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');

// GET 查詢學生案例
router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    let query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }

    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 0);

    res.json({
      success: true,
      data: {
        cases,
        total: cases.length
      },
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    console.error('Error fetching student cases:', error);
    res.status(500).json({
      success: false,
      message: '獲取學生案例時發生錯誤'
    });
  }
});

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('✅ 收到導師個案 POST 請求');
  res.json({ message: '成功收到導師個案 POST 請求', data: req.body });
});

module.exports = router; 