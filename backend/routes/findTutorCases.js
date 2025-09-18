const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');
const CATEGORY_OPTIONS = require('../constants/categoryOptions');

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
          tutorCaseCount: count
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

// GET 查詢導師案例
router.get('/', async (req, res) => {
  console.log('📥 Received request to /api/find-tutor-cases');
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

    // 構建查詢條件
    const query = {};
    
    // 如果是獲取推薦案例，只顯示已審批的
    if (req.query.featured === 'true') {
      query.isApproved = true;
      query.featured = true;
    } else {
      // 如果有 studentId 參數，顯示所有已審批的案例，以及當前用戶發布的未審批案例
      if (req.query.studentId) {
        query.$or = [
          { isApproved: true },
          { studentId: req.query.studentId } // 如果是當前用戶發布的案例，即使未審批也顯示
        ];
      } else {
        // 如果沒有 studentId（如首頁），只顯示已審批的案例
        query.isApproved = true;
      }
    }

    // 地區搜尋
    if (req.query.region) {
      const regionArray = Array.isArray(req.query.region) ? req.query.region : [req.query.region];
      
      // 支援多種地區資料結構
      query.$or = [
        // 檢查 regions 陣列
        { regions: { $in: regionArray } },
        // 檢查 region 單一值
        { region: { $in: regionArray } },
        // 檢查 region 是否為陣列
        { region: { $elemMatch: { $in: regionArray } } }
      ];
    }

    console.log('🔍 Running MongoDB query:', query);

    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    // 轉換數據格式，確保預算字段格式正確
    const transformedCases = cases.map(caseItem => {
      const transformed = caseItem.toObject();
      
      // 處理預算字段
      if (transformed.budget) {
        // 如果budget是字符串，嘗試解析為數字
        if (typeof transformed.budget === 'string') {
          const budgetValue = transformed.budget.replace(/[^0-9]/g, '');
          if (budgetValue) {
            const numValue = parseInt(budgetValue);
            transformed.budget = {
              min: numValue,
              max: numValue
            };
          }
        }
      }
      
      // 如果沒有budget但有price字段，使用price
      if (!transformed.budget && transformed.price) {
        const priceValue = typeof transformed.price === 'string' 
          ? parseInt(transformed.price.replace(/[^0-9]/g, '')) 
          : transformed.price;
        if (priceValue) {
          transformed.budget = {
            min: priceValue,
            max: priceValue
          };
        }
      }
      
      return transformed;
    });

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
    console.error('❌ Error in /api/find-tutor-cases:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message,
      mongoState: mongoose.connection.readyState
    });
  }
});

// GET 單一導師案例詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 開始查找個案 ID:', id);

    let caseItem = null;

    // 首先嘗試使用 ObjectId 查找
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('🔍 嘗試使用 ObjectId 查找');
      caseItem = await StudentCase.findById(id);
      console.log('🔍 ObjectId 查找結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      // 如果通過 _id 找不到，或者不是有效的 ObjectId，嘗試通過 id 字段查找
      console.log('🔍 嘗試使用自定義 ID 查找');
      caseItem = await StudentCase.findOne({ id: id });
      console.log('🔍 自定義 ID 查找結果:', caseItem ? '找到' : '未找到');
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
    console.log('📦 個案數據:', JSON.stringify(caseItem, null, 2));
    
    res.json({
      success: true,
      data: caseItem,
      message: '成功獲取個案詳情'
    });
  } catch (err) {
    console.error('❌ Error in /api/find-tutor-cases/:id:', err.stack);
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
  console.log('📦 收到的個案數據:', JSON.stringify(req.body, null, 2));
  
  try {
    // 驗證用戶身份
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: '未找到用戶ID'
      });
    }

    // 解析前端發送的數據結構
    const {
      title,
      description,
      category,
      subCategory,
      subjects,
      modes,
      regions,
      subRegions,
      price,
      duration,
      durationUnit,
      weeklyLessons,
      startDate,
      requirement,
      requirements
    } = req.body;

    console.log('🔍 解析的欄位:');
    console.log('- title:', title);
    console.log('- description:', description);
    console.log('- category:', category);
    console.log('- subCategory:', subCategory);
    console.log('- subjects:', subjects);
    console.log('- modes:', modes);
    console.log('- regions:', regions);
    console.log('- subRegions:', subRegions);
    console.log('- price:', price);
    console.log('- duration:', duration);
    console.log('- durationUnit:', durationUnit);
    console.log('- weeklyLessons:', weeklyLessons);
    console.log('- startDate:', startDate);
    console.log('- requirement:', requirement);
    console.log('- requirements:', requirements);

    // 驗證必要欄位
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!category) missingFields.push('category');
    if (!subjects || subjects.length === 0) missingFields.push('subjects');
    if (!modes || modes.length === 0) missingFields.push('modes');
    if (!regions || regions.length === 0) missingFields.push('regions');
    if (!price || price <= 0) missingFields.push('price');
    if (!duration || duration <= 0) missingFields.push('duration');
    if (!weeklyLessons || weeklyLessons <= 0) missingFields.push('weeklyLessons');

    if (missingFields.length > 0) {
      console.log('❌ 缺少必要欄位:', missingFields);
      return res.status(400).json({
        success: false,
        message: `請填寫所有必要欄位: ${missingFields.join(', ')}`
      });
    }

    // 驗證課堂時長
    if (durationUnit === 'minutes' && (duration < 30 || duration > 180)) {
      return res.status(400).json({
        success: false,
        message: '課堂時長必須在30-180分鐘之間'
      });
    }

    if (durationUnit === 'hours' && (duration < 0.5 || duration > 3)) {
      return res.status(400).json({
        success: false,
        message: '課堂時長必須在0.5-3小時之間'
      });
    }

    // 驗證每週堂數
    if (weeklyLessons < 1 || weeklyLessons > 7) {
      return res.status(400).json({
        success: false,
        message: '每週堂數必須在1-7堂之間'
      });
    }

    // 生成唯一ID
    const timestamp = Date.now();
    const uniqueId = `S${timestamp}`;

    // 創建新的案例
    const newCase = new StudentCase({
      id: uniqueId,
      studentId: studentId,
      title,
      description: description || '',
      requirement: requirement || requirements || '',
      requirements: requirements || requirement || '',
      category,
      subCategory: subCategory || '',
      subjects,
      modes,
      regions,
      subRegions: subRegions || [],
      budget: price.toString(),
      duration,
      durationUnit,
      weeklyLessons,
      startDate: startDate ? new Date(startDate) : undefined,
      detailedAddress: req.body.detailedAddress || '',
      status: 'open',
      featured: false,
      isApproved: true
    });

    console.log('[📦 準備創建的案例]', JSON.stringify(newCase, null, 2));

    // 保存到資料庫
    const savedCase = await newCase.save();
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

// GET 搜尋導師案例
router.get('/search', async (req, res) => {
  console.log('🔍 Search request received:', req.query);
  
  try {
    const {
      keyword,      // 關鍵字搜尋 (標題、描述)
      subject,      // 科目代碼
      subjects,     // 多個科目代碼
      region,       // 地區
      minPrice,     // 最低價格
      maxPrice,     // 最高價格
      sortBy = 'createdAt', // 排序欄位
      sortOrder = 'desc',   // 排序方向
      page = 1,     // 頁碼
      limit = 20    // 每頁數量
    } = req.query;

    // 構建查詢條件
    const query = { isApproved: true }; // 只搜尋已審批的案例

    // 關鍵字搜尋
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 科目搜尋
    if (subject) {
      // 驗證科目代碼是否有效
      const isValidSubject = Object.values(CATEGORY_OPTIONS).some(category => 
        category.subjects.some(s => s.value === subject)
      );
      
      if (isValidSubject) {
        query.subject = subject;
      }
    }

    if (subjects) {
      const subjectArray = subjects.split(',');
      // 過濾出有效的科目代碼
      const validSubjects = subjectArray.filter(subject => 
        Object.values(CATEGORY_OPTIONS).some(category => 
          category.subjects.some(s => s.value === subject)
        )
      );
      
      if (validSubjects.length > 0) {
        query.subjects = { $in: validSubjects };
      }
    }

    // 地區搜尋
    if (region) {
      const regionArray = Array.isArray(region) ? region : [region];
      
      // 支援多種地區資料結構
      query.$or = [
        // 檢查 regions 陣列
        { regions: { $in: regionArray } },
        // 檢查 region 單一值
        { region: { $in: regionArray } },
        // 檢查 region 是否為陣列
        { region: { $elemMatch: { $in: regionArray } } }
      ];
    }

    // 價格範圍
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 計算分頁
    const skip = (page - 1) * limit;

    // 執行查詢
    const [cases, total] = await Promise.all([
      StudentCase.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
              StudentCase.countDocuments(query)
    ]);

    // 獲取所有可用的科目選項
    const availableSubjects = Object.values(CATEGORY_OPTIONS).reduce((acc, category) => {
      return [...acc, ...category.subjects];
    }, []);

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          subjects: availableSubjects
        }
      }
    });

  } catch (err) {
    console.error('❌ Search error:', err);
    res.status(500).json({
      success: false,
      message: '搜尋失敗',
      error: err.message
    });
  }
});

module.exports = router; 