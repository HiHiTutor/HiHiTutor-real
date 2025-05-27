const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');

// GET 查詢學生案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  console.log('👉 Query:', req.query);

  try {
    const { featured, limit, sort } = req.query;
    const query = { isApproved: true };
    
    // 如果是獲取推薦案例
    if (featured === 'true') {
      query.featured = true;
    }

    console.log('🔍 Running MongoDB query:', query);

    // 構建查詢
    let findQuery = StudentCase.find(query);

    // 根據 sort 參數決定排序方式
    if (sort === 'latest') {
      findQuery = findQuery.sort({ createdAt: -1 }); // 倒序排序，最新的在前
    }

    // 限制返回數量
    if (limit) {
      findQuery = findQuery.limit(parseInt(limit));
    }

    const cases = await findQuery;
    console.log('✅ Query returned', cases.length, 'results');

    // 返回與前端期望一致的格式
    res.json({
      success: true,
      data: {
        cases: cases.map(case_ => ({
          ...case_.toObject(),
          id: case_._id.toString(),
          date: case_.createdAt
        }))
      }
    });
  } catch (err) {
    console.error('❌ Error in /api/find-student-cases:', err.stack);
    res.status(500).json({ 
      success: false,
      message: '獲取學生案例時發生錯誤', 
      error: err.message 
    });
  }
});

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('✅ 收到導師個案 POST 請求');
  res.json({ message: '成功收到導師個案 POST 請求', data: req.body });
});

module.exports = router; 