const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');
const mongoose = require('mongoose');

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

// 測試用：創建示例案例
router.post('/seed', async (req, res) => {
  try {
    // 清除現有資料
    await StudentCase.deleteMany({});

    // 創建示例案例
    const sampleCases = [
      {
        title: '尋找數學補習老師',
        subject: '數學',
        location: '香港島',
        budget: '300-400',
        mode: 'offline',
        requirement: '需要一位有經驗的數學老師，可以教授中學數學',
        category: '中學',
        subCategory: ['數學'],
        region: ['香港島'],
        priceRange: '300-400',
        featured: true,
        isApproved: true,
        status: 'open',
        studentId: new mongoose.Types.ObjectId(), // 使用隨機 ID
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '尋找英文會話老師',
        subject: '英文',
        location: '九龍',
        budget: '400-500',
        mode: 'online',
        requirement: '需要一位母語為英語的老師，專注於口語訓練',
        category: '中學',
        subCategory: ['英文'],
        region: ['九龍'],
        priceRange: '400-500',
        featured: true,
        isApproved: true,
        status: 'open',
        studentId: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await StudentCase.insertMany(sampleCases);
    res.json({ success: true, message: '成功創建示例案例' });
  } catch (err) {
    console.error('❌ Error creating sample cases:', err);
    res.status(500).json({ 
      success: false,
      message: '創建示例案例時發生錯誤',
      error: err.message 
    });
  }
});

module.exports = router; 