const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 調試端點：檢查環境變數
router.get('/env', (req, res) => {
  console.log('🔍 調試環境變數...');
  
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    PORT: process.env.PORT,
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    MONGODB_URI_START: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined',
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    AWS_ACCESS_KEY_ID_EXISTS: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY_EXISTS: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION_EXISTS: !!process.env.AWS_REGION,
    AWS_S3_BUCKET_EXISTS: !!process.env.AWS_S3_BUCKET,
    MONGODB_CONNECTION_STATE: mongoose.connection.readyState,
    MONGODB_CONNECTION_STATE_DESC: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  };
  
  console.log('📋 環境資訊:', envInfo);
  
  res.json({
    success: true,
    data: envInfo,
    timestamp: new Date().toISOString()
  });
});

// 調試端點：測試 MongoDB 連接
router.get('/mongodb', async (req, res) => {
  console.log('🔍 測試 MongoDB 連接...');
  
  try {
    const connectionState = mongoose.connection.readyState;
    console.log('- 當前連接狀態:', connectionState);
    
    if (connectionState !== 1) {
      console.log('⚠️ MongoDB 未連接，嘗試重新連接...');
      
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          connectTimeoutMS: 10000
        });
        console.log('✅ MongoDB 重新連接成功');
      } catch (error) {
        console.error('❌ MongoDB 重新連接失敗:', error.message);
        return res.json({
          success: false,
          error: error.message,
          connectionState: connectionState,
          connectionStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][connectionState] || 'unknown'
        });
      }
    }
    
    // 測試查詢
    const User = require('../models/User');
    const tutorCount = await User.countDocuments({ userType: 'tutor' });
    const userCount = await User.countDocuments();
    
    console.log(`✅ 查詢成功: ${tutorCount} 位導師, ${userCount} 位用戶`);
    
    res.json({
      success: true,
      data: {
        connectionState: mongoose.connection.readyState,
        connectionStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        tutorCount: tutorCount,
        userCount: userCount,
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ MongoDB 測試失敗:', error.message);
    res.json({
      success: false,
      error: error.message,
      connectionState: mongoose.connection.readyState,
      connectionStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
    });
  }
});

module.exports = router; 