const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');

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
        const count = await TutorCase.countDocuments();
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
      count = await TutorCase.countDocuments();
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

    console.log('🔍 Running MongoDB query:', query);

    const cases = await TutorCase.find(query)
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
  console.log('📥 Received request to /api/find-tutor-cases/:id');
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
      caseItem = await TutorCase.findById(id);
      console.log('🔍 使用 findById 查詢結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      // 如果通過 _id 找不到，或者不是有效的 ObjectId，嘗試通過 id 字段查找
      caseItem = await TutorCase.findOne({ id: id });
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
  try {
    // 驗證用戶身份
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: '未找到用戶ID'
      });
    }

    // 驗證必要欄位
    const {
      title,
      description,
      subject,
      subjects,
      category,
      lessonDetails
    } = req.body;

    if (!title || !description || !subjects || !category || !lessonDetails) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位'
      });
    }

    // 驗證課堂詳情
    if (!lessonDetails.duration || !lessonDetails.pricePerLesson || !lessonDetails.lessonsPerWeek) {
      return res.status(400).json({
        success: false,
        message: '請填寫完整的課堂詳情'
      });
    }

    // 驗證課堂時長
    if (lessonDetails.duration < 30 || lessonDetails.duration > 180 || lessonDetails.duration % 30 !== 0) {
      return res.status(400).json({
        success: false,
        message: '課堂時長必須在30-180分鐘之間，且必須是30分鐘的倍數'
      });
    }

    // 驗證每週堂數
    if (lessonDetails.lessonsPerWeek < 1) {
      return res.status(400).json({
        success: false,
        message: '每週至少要有1堂課'
      });
    }

    // 創建新的案例
    const newCase = new TutorCase({
      student: studentId,
      title,
      description,
      subject,
      subjects,
      category,
      subCategory: req.body.subCategory,
      regions: req.body.regions || [],
      subRegions: req.body.subRegions || [],
      mode: req.body.mode,
      modes: req.body.modes,
      lessonDetails,
      experience: req.body.experience || '無教學經驗要求',
      status: 'open',
      featured: false,
      isApproved: false
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

module.exports = router; 