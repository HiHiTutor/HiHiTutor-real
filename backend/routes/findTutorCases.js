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