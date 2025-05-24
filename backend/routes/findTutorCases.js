const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');
const { verifyToken } = require('../middleware/authMiddleware');

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

// POST 創建導師案例
router.post('/', verifyToken, async (req, res) => {
  console.log('📥 Received POST request to /api/find-tutor-cases');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 User from token:', req.user);

  try {
    const {
      studentId,
      category,
      subCategory,
      subjects,
      regions,
      subRegions,
      budget
    } = req.body;

    // 使用 token 中的用戶 ID
    const userId = req.user.id;
    console.log('👤 User ID from token:', userId);

    // 驗證必要字段
    if (!category || !subjects || !budget) {
      console.log('❌ Missing required fields:', {
        category: !!category,
        subjects: !!subjects,
        budget: !!budget
      });
      return res.status(400).json({
        success: false,
        message: '缺少必要字段',
        required: ['category', 'subjects', 'budget']
      });
    }

    // 驗證 budget 格式
    if (!budget.min || !budget.max) {
      console.log('❌ Invalid budget format:', budget);
      return res.status(400).json({
        success: false,
        message: '預算格式不正確',
        required: { min: 'number', max: 'number' }
      });
    }

    // 驗證 subjects 格式
    if (!Array.isArray(subjects)) {
      console.log('❌ Invalid subjects format:', subjects);
      return res.status(400).json({
        success: false,
        message: '科目必須是陣列格式'
      });
    }

    const newCase = new TutorCase({
      studentId: userId.toString(), // 使用 token 中的用戶 ID
      category,
      subCategory,
      subjects,
      regions: regions || [],
      subRegions: subRegions || [],
      budget: {
        min: Number(budget.min),
        max: Number(budget.max)
      },
      isApproved: false,
      createdAt: new Date()
    });

    console.log('📝 Creating new case:', JSON.stringify(newCase, null, 2));

    const savedCase = await newCase.save();
    console.log('✅ Successfully created new tutor case:', JSON.stringify(savedCase, null, 2));
    
    res.status(201).json({
      success: true,
      message: '成功創建導師案例',
      case: savedCase
    });
  } catch (err) {
    console.error('❌ Error creating tutor case:', err);
    console.error('❌ Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: '創建導師案例失敗',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router; 