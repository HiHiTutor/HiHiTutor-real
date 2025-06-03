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

// GET /api/find-student-cases
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  
  try {
    // 構建查詢條件
    const query = {};
    
    // 如果有搜索條件，添加到查詢中
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 如果有類別篩選
    if (req.query.category) {
      query.category = req.query.category;
    }

    // 如果有子類別篩選
    if (req.query.subCategory) {
      query.subCategory = req.query.subCategory;
    }

    // 如果有地區篩選
    if (req.query.region) {
      query.regions = req.query.region;
    }

    // 如果有子地區篩選
    if (req.query.subRegion) {
      query.subRegions = req.query.subRegion;
    }

    // 如果有授課模式篩選
    if (req.query.mode) {
      query.mode = req.query.mode;
    }

    // 如果有經驗要求篩選
    if (req.query.experience) {
      query.experience = req.query.experience;
    }

    // 獲取總數量（用於分頁）
    const count = await StudentCase.countDocuments();
    
    // 如果是獲取推薦案例，只顯示已審批的
    if (req.query.featured === 'true') {
      query.isApproved = true;
      query.featured = true;
    } else {
      // 如果有 tutorId 參數，顯示所有已審批的案例，以及當前用戶發布的未審批案例
      if (req.query.tutorId) {
        query.$or = [
          { isApproved: true },
          { tutorId: req.query.tutorId } // 如果是當前用戶發布的案例，即使未審批也顯示
        ];
      } else {
        // 如果沒有 tutorId（如首頁），只顯示已審批的案例
        query.isApproved = true;
      }
    }

    console.log('🔍 Running MongoDB query:', query);

    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    console.log('✅ Query returned', cases.length, 'results');
    res.json({
      success: true,
      data: {
        cases: cases,
        totalCount: cases.length,
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
      requirements,
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
      mode: mapModeToChineseValue(Array.isArray(modes) ? modes[0] : modes), // 轉換模式值
      modes: Array.isArray(modes) ? modes.map(mapModeToChineseValue) : [mapModeToChineseValue(modes)],
      budget: (budget || price || '').toString(),
      location: location || '',
      duration: lessonDuration || duration || 60,
      durationUnit: durationUnit || 'minutes',
      weeklyLessons: weeklyLessons || 1,
      requirements: requirements || description || '',
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