const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');
const { verifyToken } = require('../middleware/authMiddleware');

// GET 查詢導師案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-tutor-cases');
  console.log('👉 Query:', req.query);

  try {
    // 構建查詢條件
    const query = {};
    
    // 如果是獲取推薦案例，只顯示已審批的
    if (req.query.featured === 'true') {
      query.isApproved = true;
      query.featured = true;
    } else {
      // 否則顯示所有已審批的案例，以及當前用戶發布的未審批案例
      query.$or = [
        { isApproved: true },
        { studentId: req.query.studentId } // 如果是當前用戶發布的案例，即使未審批也顯示
      ];
    }

    console.log('🔍 Running MongoDB query:', query);

    const cases = await TutorCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    console.log('✅ Query returned', cases.length, 'results');
    res.json({
      success: true,
      data: {
        cases: cases
      }
    });
  } catch (err) {
    console.error('❌ Error in /api/find-tutor-cases:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// POST 創建導師案例
router.post('/', verifyToken, async (req, res) => {
  console.log('📥 Received POST request to /api/find-tutor-cases');
  console.log('[🟢 收到前端傳來的資料]', JSON.stringify(req.body, null, 2));
  console.log('[🟢 Token 中的用戶資料]', JSON.stringify(req.user, null, 2));

  try {
    // 從 token 中獲取用戶 ID
    const studentId = req.user.id;
    if (!studentId) {
      console.error('❌ No studentId found in token');
      return res.status(401).json({ success: false, message: '未授權的請求' });
    }

    // 驗證必要欄位
    const { category, subjects, budget } = req.body;
    console.log('[🔍 驗證必要欄位]', {
      studentId,
      category,
      subjects,
      budget
    });

    if (!category) {
      console.error('❌ Missing category');
      return res.status(400).json({ success: false, message: '請選擇分類' });
    }
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      console.error('❌ Invalid subjects:', subjects);
      return res.status(400).json({ success: false, message: '請選擇至少一個科目' });
    }
    if (!budget || !budget.min || !budget.max) {
      console.error('❌ Invalid budget:', budget);
      return res.status(400).json({ success: false, message: '請填寫預算範圍' });
    }

    // 創建新的案例，不要包含 id 欄位
    const newCase = {
      studentId,
      category,
      subCategory: req.body.subCategory,
      subjects: req.body.subjects,
      regions: req.body.regions || [],
      subRegions: req.body.subRegions || [],
      budget: req.body.budget,
      mode: req.body.mode,
      experience: req.body.experience,
      featured: false,
      isApproved: false
    };

    console.log('[📦 準備創建的案例]', JSON.stringify(newCase, null, 2));

    // 保存到資料庫
    const savedCase = await TutorCase.create(newCase);
    console.log('[✅ 成功創建的案例]', JSON.stringify(savedCase, null, 2));

    res.status(201).json({
      success: true,
      message: '案例創建成功',
      data: savedCase
    });
  } catch (err) {
    console.error('[❌ 建立個案失敗]', err);
    console.error('[❌ 錯誤詳情]', {
      name: err.name,
      message: err.message,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false, 
      message: '建立學生案例失敗',
      error: err.message
    });
  }
});

module.exports = router; 