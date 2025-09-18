const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');

// 分類映射函數：將中文值轉換為前端的英文值
const mapCategoryToEnglishValue = (category) => {
  const categoryMap = {
    '幼兒': 'early-childhood',
    '幼稚園': 'early-childhood',
    '小學': 'primary-secondary',
    '中學': 'primary-secondary',
    '高中': 'primary-secondary',
    '國中': 'primary-secondary',
    '興趣': 'interest',
    '大學': 'tertiary',
    '大專': 'tertiary',
    '成人': 'adult',
    '職業': 'adult'
  };
  return categoryMap[category] || category;
};

// 模式映射函數：將前端的英文值轉換為後端的中文值
const mapModeToChineseValue = (mode) => {
  const modeMap = {
    'in-person': '面對面',
    'online': '線上',
    'both': 'both',
    '面對面': '面對面',
    '線上': '線上',
    '網課': '線上',
    '面授': '面對面'
  };
  return modeMap[mode] || mode;
};

// 複雜的推薦演算法函數
const getRecommendedCases = async (maxResults = 8) => {
  console.log('🎯 Starting recommendation algorithm with maxResults:', maxResults);
  
  try {
    // 首先嘗試獲取所有案例
    const allCases = await StudentCase.find({})
      .sort({ createdAt: -1 })
      .limit(maxResults);

    if (allCases.length > 0) {
      console.log('✅ Found regular cases:', allCases.length);
      return allCases;
    }

    // 如果沒有找到任何案例，創建一些測試案例
    console.log('⚠️ No cases found, creating test cases...');
    const testCases = [
      {
        title: '尋找數學補習老師',
        subjects: ['數學'],
        region: '香港島',
        mode: '線上',
        experience: '1-3年教學經驗',
        featured: true,
        status: 'open',
        budget: '300-400',
        category: '中學',
        subCategory: ['數學'],
        regions: ['香港島'],
        modes: ['online'],
        lessonDetails: {
          duration: 60,
          pricePerLesson: 350,
          lessonsPerWeek: 2
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '高中英文補習',
        subjects: ['英文'],
        region: '九龍',
        mode: '面對面',
        experience: '3-5年教學經驗',
        featured: true,
        status: 'open',
        budget: '400-500',
        category: '高中',
        subCategory: ['英文'],
        regions: ['九龍'],
        modes: ['in-person'],
        lessonDetails: {
          duration: 90,
          pricePerLesson: 450,
          lessonsPerWeek: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const testCase of testCases) {
      const newCase = new StudentCase(testCase);
      await newCase.save();
    }

    console.log('✅ Created test cases');
    return await StudentCase.find({})
      .sort({ createdAt: -1 })
      .limit(maxResults);
    
  } catch (error) {
    console.error('❌ Error in recommendation algorithm:', error);
    return [];
  }
};

// 測試端點 - 用於診斷問題
router.get('/test', async (req, res) => {
  console.log('📥 Test endpoint called');
  
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'N/A'
      },
      mongoose: {
        connectionState: mongoose.connection.readyState,
        connectionStates: {
          0: 'disconnected',
          1: 'connected', 
          2: 'connecting',
          3: 'disconnecting'
        },
        currentState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      }
    };

    // 嘗試簡單的數據庫操作
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await StudentCase.countDocuments();
        diagnostics.database = {
          connected: true,
          studentCaseCount: count
        };
      } catch (dbError) {
        diagnostics.database = {
          connected: false,
          error: dbError.message
        };
      }
    } else {
      diagnostics.database = {
        connected: false,
        reason: 'MongoDB not connected'
      };
    }

    res.json({
      success: true,
      message: 'Test endpoint working',
      diagnostics
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  }
});

// Helper function to transform case data
const transformCaseData = (caseData) => {
  // Parse budget string into min/max object
  let budgetObj = { min: 0, max: 0 };
  if (caseData.budget) {
    if (typeof caseData.budget === 'string' && caseData.budget.includes('-')) {
      const budgetParts = caseData.budget.split('-').map(num => parseInt(num.trim()));
      budgetObj = {
        min: budgetParts[0] || 0,
        max: budgetParts[1] || budgetParts[0] || 0
      };
    } else if (typeof caseData.budget === 'object' && caseData.budget.min !== undefined) {
      budgetObj = caseData.budget;
    } else if (typeof caseData.budget === 'number') {
      budgetObj = { min: caseData.budget, max: caseData.budget };
    } else if (typeof caseData.budget === 'string') {
      const num = parseInt(caseData.budget);
      if (!isNaN(num)) {
        budgetObj = { min: num, max: num };
      }
    }
  }

  // 處理地區字段 - 支援多種格式
  let regions = [];
  let subRegions = [];
  
  // 處理 regions 字段
  if (caseData.regions && Array.isArray(caseData.regions)) {
    regions = caseData.regions;
  } else if (caseData.region && Array.isArray(caseData.region)) {
    regions = caseData.region;
  } else if (caseData.region && typeof caseData.region === 'string') {
    regions = [caseData.region];
  }
  
  // 處理 subRegions 字段
  if (caseData.subRegions && Array.isArray(caseData.subRegions)) {
    subRegions = caseData.subRegions;
  } else if (caseData.subRegion && Array.isArray(caseData.subRegion)) {
    subRegions = caseData.subRegion;
  } else if (caseData.subRegion && typeof caseData.subRegion === 'string') {
    subRegions = [caseData.subRegion];
  }

  // Transform the data to match frontend expectations
  return {
    id: caseData.id || caseData._id.toString(),
    title: caseData.title || '',
    category: caseData.category || '',
    subCategory: caseData.subCategory || '',
    subjects: caseData.subjects || [caseData.subject].filter(Boolean),
    region: regions[0] || '',
    regions: regions,
    subRegion: subRegions[0] || '',
    subRegions: subRegions,
    mode: caseData.mode || '',
    modes: caseData.modes || [caseData.mode].filter(Boolean),
    budget: budgetObj,
    experience: caseData.experience || '',
    featured: caseData.featured || false,
    date: caseData.createdAt,
    createdAt: caseData.createdAt
  };
};

// GET /api/find-student-cases
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  
  try {
    const { featured, limit, search, category, subCategory, region, regions, modes, subjects } = req.query;
    
    console.log('🔍 查詢參數:', { featured, limit, search, category, subCategory, region, regions, modes, subjects });
    
    // 構建查詢條件
    const query = { isApproved: true }; // 只顯示已審批的案例
    
    // 如果有搜索條件，添加到查詢中
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 如果有類別篩選
    if (category && category !== 'unlimited') {
      query.category = category;
    }

    // 如果有子類別篩選
    if (subCategory && subCategory !== 'unlimited') {
      query.subCategory = subCategory;
    }

    // 如果有科目篩選
    if (subjects && subjects.length > 0) {
      const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
      console.log('📚 科目篩選條件:', subjectArray);
      
      // 檢查 subjects 字段（數組）或 subject 字段（字符串）
      const subjectConditions = subjectArray.map(subject => ({
        $or: [
          { subjects: { $in: [subject] } },
          { subject: subject }
        ]
      }));
      
      if (query.$or) {
        // 如果已經有 $or 條件，需要合併
        const existingOr = query.$or;
        query.$and = [
          { $or: existingOr },
          { $or: subjectConditions }
        ];
        delete query.$or;
      } else {
        query.$or = subjectConditions;
      }
    }

    // 如果有地區篩選
    if (
      (region && region !== 'unlimited') ||
      (regions && regions !== 'unlimited')
    ) {
      const regionValue = region !== 'unlimited' ? region : regions;
      const regionConditions = [
        { region: regionValue },
        { regions: regionValue }
      ];
      
      if (query.$or) {
        // 如果已經有 $or 條件，需要合併
        const existingOr = query.$or;
        query.$and = [
          { $or: existingOr },
          { $or: regionConditions }
        ];
        delete query.$or;
      } else {
        query.$or = regionConditions;
      }
    }

    // 如果有教學模式篩選
    if (modes && modes !== 'unlimited') {
      const modeConditions = [
        { mode: modes },
        { modes: modes }
      ];
      
      if (query.$or) {
        // 如果已經有 $or 條件，需要合併
        const existingOr = query.$or;
        query.$and = [
          { $or: existingOr },
          { $or: modeConditions }
        ];
        delete query.$or;
      } else {
        query.$or = modeConditions;
      }
    }

    // 如果是特色案例
    if (featured === 'true') {
      query.featured = true;
    }

    // 獲取總數
    const count = await StudentCase.countDocuments(query);

    // 獲取案例列表
    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    // 調試日誌：檢查原始數據
    console.log('🔍 原始數據示例：', cases[0]);
    console.log('🔍 檢查原始數據的地區字段：', cases.map(c => ({ 
      id: c.id || c._id, 
      regions: c.regions, 
      subRegions: c.subRegions,
      region: c.region 
    })));

    // 轉換數據格式
    const transformedCases = cases.map(transformCaseData);

    // 調試日誌：檢查轉換後的數據結構
    console.log('🔍 轉換後的數據結構示例：', transformedCases[0]);
    console.log('🔍 檢查 regions 字段：', transformedCases.map(c => ({ id: c.id, regions: c.regions, subRegions: c.subRegions })));

    console.log('✅ Query returned', transformedCases.length, 'results');
    res.json({
      success: true,
      data: {
        cases: transformedCases,
        totalCount: transformedCases.length,
        allDocumentsCount: count
      }
    });
  } catch (err) {
    console.error('❌ Error in /api/find-student-cases:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message,
      mongoState: mongoose.connection.readyState
    });
  }
});

// GET 單一學生案例詳情
router.get('/:id', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases/:id');
  console.log('👉 Case ID:', req.params.id);

  try {
    // 檢查數據庫連接狀態
    console.log('📊 MongoDB connection state:', mongoose.connection.readyState);
    
    // 如果數據庫未連接，嘗試重新連接
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, current state:', mongoose.connection.readyState);
      
      if (process.env.MONGODB_URI) {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        try {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          });
          console.log('✅ Reconnected to MongoDB');
        } catch (reconnectError) {
          console.error('❌ Failed to reconnect to MongoDB:', reconnectError);
          return res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: reconnectError.message
          });
        }
      } else {
        console.error('❌ No MongoDB URI found in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Database configuration error',
          error: 'MONGODB_URI not found'
        });
      }
    }

    const id = req.params.id;
    let caseItem = null;

    // 檢查是否為有效的 MongoDB ObjectId 格式
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // 如果是有效的 ObjectId，使用 findById
      caseItem = await StudentCase.findById(id);
      console.log('🔍 使用 findById 查詢結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      // 如果通過 _id 找不到，或者不是有效的 ObjectId，嘗試通過 id 字段查找
      caseItem = await StudentCase.findOne({ id: id });
      console.log('🔍 使用 findOne({id}) 查詢結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      console.log('❌ 找不到個案 ID:', id);
      return res.status(404).json({
        success: false,
        error: 'Case not found',
        message: '找不到指定的個案'
      });
    }

    console.log('✅ 成功找到個案:', id);
    res.json({
      success: true,
      data: caseItem,
      message: '成功獲取個案詳情'
    });
  } catch (err) {
    console.error('❌ Error in /api/find-student-cases/:id:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
      id,
      tutorId,
      student, // 添加 student 字段
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
      requirements,
      detailedAddress,
      startDate,
      // 新增的推薦相關字段
      isVip,
      vipLevel,
      isTop,
      topLevel,
      ratingScore,
      ratingCount,
      isPaid,
      paymentType,
      promotionLevel,
      featured
    } = req.body;

    console.log('🔍 驗證欄位:', {
      tutorId: !!tutorId,
      title: title !== undefined,
      category: !!category,
      subjects: subjects && subjects.length > 0,
      regions: regions && regions.length > 0,
      modes: modes && modes.length > 0,
      budget: !!(budget || price),
      // 新增字段的驗證
      isVip: isVip !== undefined,
      vipLevel: vipLevel !== undefined,
      isTop: isTop !== undefined,
      topLevel: topLevel !== undefined,
      ratingScore: ratingScore !== undefined,
      paymentType: paymentType !== undefined
    });

    if (/*!tutorId ||*/ title === undefined || !category || 
        !subjects || !Array.isArray(subjects) || subjects.length === 0 ||
        !regions || !Array.isArray(regions) || regions.length === 0 ||
        !modes || !Array.isArray(modes) || modes.length === 0 ||
        !(budget || price)) {
      
      console.log('❌ 驗證失敗，缺少必要欄位:', {
        // tutorId,
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
          // tutorId: !tutorId ? '缺少導師ID' : null,
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
      id: id,
      // tutorId,
      studentId: student, // 添加學生ID
      title: title || '',
      description: description || '',
      category,
      subCategory: subCategory || '',
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      regions: Array.isArray(regions) ? regions : [regions],
      subRegions: Array.isArray(subRegions) ? subRegions : [subRegions],
      mode: mapModeToChineseValue(Array.isArray(modes) ? modes[0] : modes), // 轉換模式值
      modes: Array.isArray(modes) ? modes.map(mapModeToChineseValue) : [mapModeToChineseValue(modes)],
      budget: (budget || price || '').toString(),
      location: location || '',
      duration: lessonDuration || duration || 60,
      durationUnit: durationUnit || 'minutes',
      weeklyLessons: weeklyLessons || 1,
      requirements: requirements || description || '',
      detailedAddress: detailedAddress || '',
      startDate: startDate ? new Date(startDate) : null,
      featured: featured !== undefined ? featured : false,
      // 新增的推薦相關字段
      isVip: isVip !== undefined ? isVip : false,
      vipLevel: vipLevel !== undefined ? Math.max(0, Math.min(2, vipLevel)) : 0,
      isTop: isTop !== undefined ? isTop : false,
      topLevel: topLevel !== undefined ? Math.max(0, Math.min(2, topLevel)) : 0,
      ratingScore: ratingScore !== undefined ? Math.max(0, Math.min(5, ratingScore)) : 0,
      ratingCount: ratingCount !== undefined ? Math.max(0, ratingCount) : 0,
      isPaid: isPaid !== undefined ? isPaid : false,
      paymentType: paymentType || 'free',
      promotionLevel: promotionLevel !== undefined ? Math.max(0, Math.min(5, promotionLevel)) : 0,
      status: 'open',
      isApproved: false, // 新創建的案例需要審批
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

    // 創建示例案例 - 使用正確的地區值格式
    const sampleCases = [
      {
        id: 'test-student-1',
        title: '尋找數學補習老師',
        subject: '數學',
        subjects: ['數學'],
        budget: '300-400',
        mode: 'in-person',
        modes: ['in-person'],
        requirement: '需要一位有經驗的數學老師，可以教授中學數學',
        category: '中學',
        subCategory: '數學',
        regions: ['kowloon'],
        subRegions: ['mong-kok'],
        priceRange: '300-400',
        featured: true,
        isApproved: true,
        status: 'open',
        studentId: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'test-student-2',
        title: '尋找英文會話老師',
        subject: '英文',
        subjects: ['英文'],
        budget: '400-500',
        mode: 'online',
        modes: ['online'],
        requirement: '需要一位母語為英語的老師，專注於口語訓練',
        category: '中學',
        subCategory: '英文',
        regions: ['hong-kong-island'],
        subRegions: ['causeway-bay'],
        priceRange: '400-500',
        featured: true,
        isApproved: true,
        status: 'open',
        studentId: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'test-student-3',
        title: 'IB物理補習',
        subject: '物理',
        subjects: ['物理'],
        budget: '500-600',
        mode: 'online',
        modes: ['online'],
        requirement: '需要IB物理教學經驗',
        category: '大學',
        subCategory: 'IB',
        regions: ['hong-kong-island'],
        subRegions: ['central'],
        priceRange: '500-600',
        featured: true,
        isApproved: true,
        status: 'open',
        studentId: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await StudentCase.insertMany(sampleCases);
    console.log('✅ 成功創建測試案例，數量：', sampleCases.length);
    res.json({ 
      success: true, 
      message: '成功創建示例案例',
      count: sampleCases.length
    });
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