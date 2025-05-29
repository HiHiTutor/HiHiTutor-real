const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');

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
  
  const usedIds = new Set();
  const results = [];
  
  // 定義各類型的最大數量限制
  const limits = {
    vipHighRating: 2,    // VIP 置頂 + 高評分：最多 2 個
    vipNormal: 2,        // VIP 置頂（無評分限制）：最多 2 個
    topHighRating: 1,    // 置頂 + 高評分：最多 1 個
    topNormal: 1,        // 置頂（無評分限制）：最多 1 個
    normalHighRating: 1, // 普通高評分：最多 1 個
    fallback: 1          // 其他普通 fallback 個案：最多 1 個
  };
  
  try {
    // 1. VIP 置頂 + 高評分（ratingScore >= 4）
    console.log('🔍 Fetching VIP + High Rating cases...');
    const vipHighRatingCases = await StudentCase.find({
      featured: true,
      isVip: true,
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      vipLevel: -1, 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(limits.vipHighRating);
    
    vipHighRatingCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'vip_high_rating';
        case_._priorityScore = 100 + case_.ratingScore * 10 + case_.vipLevel * 5;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 2. VIP 置頂（無評分限制）
    console.log('🔍 Fetching VIP cases...');
    const vipNormalCases = await StudentCase.find({
      featured: true,
      isVip: true,
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      vipLevel: -1, 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(limits.vipNormal);
    
    vipNormalCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'vip_normal';
        case_._priorityScore = 80 + case_.ratingScore * 5 + case_.vipLevel * 5;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 3. 置頂 + 高評分（ratingScore >= 4）
    console.log('🔍 Fetching Top + High Rating cases...');
    const topHighRatingCases = await StudentCase.find({
      featured: true,
      isTop: true,
      isVip: { $ne: true }, // 排除已經是 VIP 的
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      topLevel: -1, 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(limits.topHighRating);
    
    topHighRatingCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'top_high_rating';
        case_._priorityScore = 70 + case_.ratingScore * 8 + case_.topLevel * 3;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 4. 置頂（無評分限制）
    console.log('🔍 Fetching Top cases...');
    const topNormalCases = await StudentCase.find({
      featured: true,
      isTop: true,
      isVip: { $ne: true }, // 排除已經是 VIP 的
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      topLevel: -1, 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(limits.topNormal);
    
    topNormalCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'top_normal';
        case_._priorityScore = 60 + case_.ratingScore * 3 + case_.topLevel * 3;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 5. 普通 + 高評分
    console.log('🔍 Fetching Normal + High Rating cases...');
    const normalHighRatingCases = await StudentCase.find({
      featured: true,
      isVip: { $ne: true },
      isTop: { $ne: true },
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(limits.normalHighRating);
    
    normalHighRatingCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'normal_high_rating';
        case_._priorityScore = 50 + case_.ratingScore * 5;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 6. 其他普通 fallback 個案
    console.log('🔍 Fetching Fallback cases...');
    const fallbackCases = await StudentCase.find({
      featured: true,
      isVip: { $ne: true },
      isTop: { $ne: true },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ 
      ratingScore: -1, 
      createdAt: -1 
    }).limit(Math.max(limits.fallback, maxResults - results.length));
    
    fallbackCases.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'fallback';
        case_._priorityScore = 30 + case_.ratingScore * 2;
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    console.log('✅ Recommendation algorithm completed');
    console.log('📊 Results breakdown:', {
      total: results.length,
      vipHighRating: results.filter(c => c._recommendationType === 'vip_high_rating').length,
      vipNormal: results.filter(c => c._recommendationType === 'vip_normal').length,
      topHighRating: results.filter(c => c._recommendationType === 'top_high_rating').length,
      topNormal: results.filter(c => c._recommendationType === 'top_normal').length,
      normalHighRating: results.filter(c => c._recommendationType === 'normal_high_rating').length,
      fallback: results.filter(c => c._recommendationType === 'fallback').length
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in recommendation algorithm:', error);
    // 如果推薦演算法失敗，返回基本的 featured 案例
    return await StudentCase.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(maxResults);
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

// GET 查詢學生案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-student-cases');
  console.log('👉 Query:', req.query);
  console.log('👉 Headers:', req.headers);
  console.log('👉 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
  });

  try {
    // 檢查數據庫連接狀態
    console.log('📊 MongoDB connection state:', mongoose.connection.readyState);
    console.log('📊 MongoDB connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    // 如果數據庫未連接，嘗試重新連接
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, current state:', mongoose.connection.readyState);
      
      // 嘗試重新連接
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
            error: reconnectError.message,
            mongoState: mongoose.connection.readyState,
            hasMongoUri: !!process.env.MONGODB_URI
          });
        }
      } else {
        console.error('❌ No MongoDB URI found in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Database configuration error',
          error: 'MONGODB_URI not found',
          mongoState: mongoose.connection.readyState,
          hasMongoUri: false
        });
      }
    }

    // 測試數據庫連接
    console.log('🔍 Testing database connection...');
    let count;
    try {
      count = await StudentCase.countDocuments();
      console.log('📊 Total documents in collection:', count);
    } catch (countError) {
      console.error('❌ Error counting documents:', countError);
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: countError.message,
        mongoState: mongoose.connection.readyState
      });
    }

    const { featured, limit, sort } = req.query;
    const query = {};
    
    // 如果是獲取推薦案例，使用複雜的混合演算法
    if (featured === 'true') {
      query.featured = true;
      
      // 實現混合推薦演算法
      const recommendedCases = await getRecommendedCases(limit ? parseInt(limit) : 8);
      
      // 返回推薦結果
      res.json({
        success: true,
        data: {
          cases: recommendedCases.map(case_ => {
            try {
              const caseObj = case_.toObject();
              return {
                ...caseObj,
                id: case_.id || case_._id.toString(),
                date: case_.createdAt,
                // 確保必要欄位存在
                title: caseObj.title || '',
                category: caseObj.category || '',
                budget: caseObj.budget || '',
                mode: caseObj.mode || '線上',
                subjects: Array.isArray(caseObj.subjects) ? caseObj.subjects : [],
                regions: Array.isArray(caseObj.regions) ? caseObj.regions : [],
                // 處理舊格式的兼容性
                subject: caseObj.subject || (Array.isArray(caseObj.subjects) && caseObj.subjects.length > 0 ? caseObj.subjects[0] : ''),
                location: caseObj.location || (Array.isArray(caseObj.regions) && caseObj.regions.length > 0 ? caseObj.regions[0] : ''),
                requirement: caseObj.requirement || caseObj.requirements || '',
                priceRange: caseObj.priceRange || caseObj.budget || '',
                // 添加推薦相關信息
                recommendationType: caseObj._recommendationType || 'normal',
                priorityScore: caseObj._priorityScore || 0
              };
            } catch (err) {
              console.error('❌ Error processing case:', case_._id, err);
              return {
                id: case_._id.toString(),
                title: '數據錯誤',
                category: '',
                budget: '',
                mode: '線上',
                subjects: [],
                regions: [],
                date: case_.createdAt || new Date()
              };
            }
          }),
          totalCount: recommendedCases.length,
          allDocumentsCount: count,
          recommendationInfo: {
            algorithm: 'mixed_priority',
            maxResults: limit ? parseInt(limit) : 8,
            appliedAt: new Date().toISOString()
          }
        }
      });
      return;
    }

    console.log('🔍 Running MongoDB query:', query);

    // 計算符合查詢條件的文檔總數
    let filteredCount;
    try {
      filteredCount = await StudentCase.countDocuments(query);
      console.log('📊 Documents matching query:', filteredCount);
    } catch (countError) {
      console.error('❌ Error counting filtered documents:', countError);
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: countError.message,
        mongoState: mongoose.connection.readyState
      });
    }

    // 構建查詢
    let findQuery = StudentCase.find(query);

    // 根據 sort 參數決定排序方式
    let sortCriteria;
    if (sort === 'latest') {
      sortCriteria = { createdAt: -1 }; // 倒序排序，最新的在前
      findQuery = findQuery.sort(sortCriteria);
    } else if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 }; // 正序排序，最舊的在前
      findQuery = findQuery.sort(sortCriteria);
    } else if (sort === 'featured') {
      sortCriteria = { featured: -1, createdAt: -1 }; // featured 優先，然後按時間倒序
      findQuery = findQuery.sort(sortCriteria);
    } else {
      // 默認排序：featured 案例優先，然後按創建時間倒序
      sortCriteria = { 
        featured: -1,    // featured 案例優先 (true > false)
        createdAt: -1    // 然後按創建時間倒序 (最新的在前)
      };
      findQuery = findQuery.sort(sortCriteria);
    }

    console.log('🔍 Sort criteria:', sortCriteria);

    // 限制返回數量
    if (limit) {
      findQuery = findQuery.limit(parseInt(limit));
    }

    console.log('🔍 Executing query...');
    let cases;
    try {
      cases = await findQuery;
      console.log('✅ Query returned', cases.length, 'results');
    } catch (queryError) {
      console.error('❌ Error executing query:', queryError);
      return res.status(500).json({
        success: false,
        message: 'Database query execution failed',
        error: queryError.message,
        mongoState: mongoose.connection.readyState
      });
    }
    
    if (cases.length > 0) {
      console.log('📄 Sample case structure:', JSON.stringify(cases[0], null, 2));
    }

    // 返回與前端期望一致的格式
    res.json({
      success: true,
      data: {
        cases: cases.map(case_ => {
          try {
            const caseObj = case_.toObject();
            return {
              ...caseObj,
              id: case_.id || case_._id.toString(),
              date: case_.createdAt,
              // 確保必要欄位存在
              title: caseObj.title || '',
              category: caseObj.category || '',
              budget: caseObj.budget || '',
              mode: caseObj.mode || '線上',
              subjects: Array.isArray(caseObj.subjects) ? caseObj.subjects : [],
              regions: Array.isArray(caseObj.regions) ? caseObj.regions : [],
              // 處理舊格式的兼容性
              subject: caseObj.subject || (Array.isArray(caseObj.subjects) && caseObj.subjects.length > 0 ? caseObj.subjects[0] : ''),
              location: caseObj.location || (Array.isArray(caseObj.regions) && caseObj.regions.length > 0 ? caseObj.regions[0] : ''),
              requirement: caseObj.requirement || caseObj.requirements || '',
              priceRange: caseObj.priceRange || caseObj.budget || ''
            };
          } catch (err) {
            console.error('❌ Error processing case:', case_._id, err);
            // 返回一個基本的案例對象
            return {
              id: case_._id.toString(),
              title: '數據錯誤',
              category: '',
              budget: '',
              mode: '線上',
              subjects: [],
              regions: [],
              date: case_.createdAt || new Date()
            };
          }
        }),
        totalCount: filteredCount, // 使用符合查詢條件的總數
        allDocumentsCount: count // 可選：提供所有文檔的總數用於調試
      }
    });
  } catch (err) {
    console.error('❌ Error in /api/find-student-cases:', err.stack);
    console.error('❌ Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // 返回更詳細的錯誤信息用於調試
    res.status(500).json({ 
      success: false,
      message: '獲取學生案例時發生錯誤', 
      error: err.message,
      errorName: err.name,
      errorCode: err.code,
      mongoState: mongoose.connection.readyState,
      hasMongoUri: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString()
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