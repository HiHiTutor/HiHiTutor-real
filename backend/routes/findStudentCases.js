const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');

// GET 查詢學生案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  console.log('👉 Query:', req.query);

  try {
    const { featured, limit, sort } = req.query;
    const query = {};
    
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
          id: case_.id || case_._id.toString(),
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

// POST 創建新的學生案例
router.post('/', verifyToken, async (req, res) => {
  console.log('📥 Received POST request to /api/find-student-cases');
  console.log('👉 Body:', req.body);
  console.log('👤 User:', req.user);

  try {
    const {
      tutorId,
      title,
      description,
      category,
      subCategory,
      subjects,
      regions,
      subRegions,
      modes,
      price,
      budget,
      location,
      lessonDuration,
      duration,
      durationUnit,
      weeklyLessons,
      requirements
    } = req.body;

    console.log('🔍 驗證欄位:', {
      tutorId: !!tutorId,
      title: title !== undefined,
      category: !!category,
      subjects: subjects && subjects.length > 0,
      regions: regions && regions.length > 0,
      modes: modes && modes.length > 0,
      budget: !!(budget || price)
    });

    if (!tutorId || title === undefined || !category || 
        !subjects || !Array.isArray(subjects) || subjects.length === 0 ||
        !regions || !Array.isArray(regions) || regions.length === 0 ||
        !modes || !Array.isArray(modes) || modes.length === 0 ||
        !(budget || price)) {
      
      console.log('❌ 驗證失敗，缺少必要欄位:', {
        tutorId,
        title,
        category,
        subjects,
        regions,
        modes,
        budget: budget || price
      });
      
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位',
        details: {
          tutorId: !tutorId ? '缺少導師ID' : null,
          title: title === undefined ? '缺少標題' : null,
          category: !category ? '缺少分類' : null,
          subjects: (!subjects || !Array.isArray(subjects) || subjects.length === 0) ? '缺少科目' : null,
          regions: (!regions || !Array.isArray(regions) || regions.length === 0) ? '缺少地區' : null,
          modes: (!modes || !Array.isArray(modes) || modes.length === 0) ? '缺少上課模式' : null,
          budget: !(budget || price) ? '缺少預算/價錢' : null
        }
      });
    }

    // 創建新案例
    const newCase = new StudentCase({
      id: tutorId, // 使用 tutorId 作為案例 ID
      tutorId,
      title: title || '',
      category,
      subCategory: subCategory || '',
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      regions: Array.isArray(regions) ? regions : [regions],
      subRegions: Array.isArray(subRegions) ? subRegions : [subRegions],
      mode: Array.isArray(modes) ? modes[0] : modes, // StudentCase 模型期待單個值
      modes: Array.isArray(modes) ? modes : [modes],
      budget: (budget || price || '').toString(),
      location: location || '',
      duration: lessonDuration || duration || 60,
      durationUnit: durationUnit || 'minutes',
      weeklyLessons: weeklyLessons || 1,
      requirements: requirements || description || '',
      featured: false,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedCase = await newCase.save();
    console.log('✅ 成功創建學生案例:', savedCase);

    res.status(201).json({
      success: true,
      message: '成功創建學生案例',
      data: {
        id: savedCase._id,
        ...savedCase.toObject()
      }
    });
  } catch (err) {
    console.error('❌ Error creating student case:', err);
    res.status(500).json({
      success: false,
      message: '創建學生案例時發生錯誤',
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