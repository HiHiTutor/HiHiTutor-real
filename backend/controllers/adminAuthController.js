const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const login = async (req, res) => {
  console.log('👉 收到管理員登入請求:', {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });

  try {
    // 檢查 MongoDB 連接狀態
    console.log('📊 MongoDB 連接狀態:', {
      readyState: mongoose.connection.readyState,
      stateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
    });

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log('❌ 登入失敗: 缺少帳號或密碼');
      return res.status(400).json({
        success: false,
        message: '請提供帳號和密碼'
      });
    }

    console.log('🔍 開始查找管理員用戶:', {
      identifier,
      query: {
        $or: [
          { email: identifier },
          { phone: identifier }
        ],
        userType: 'admin'
      }
    });

    // 使用 email 或 phone 查找用戶
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ],
      userType: 'admin' // 確保只有管理員可以登入
    });

    if (!user) {
      console.log('❌ 登入失敗: 找不到管理員用戶');
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    console.log('✅ 找到管理員用戶:', {
      userId: user._id,
      userType: user.userType,
      hasPassword: !!user.password
    });

    // 驗證密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ 登入失敗: 密碼錯誤');
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 檢查 JWT_SECRET 是否存在
    if (!process.env.JWT_SECRET) {
      console.error('❌ 嚴重錯誤: JWT_SECRET 未設置');
      return res.status(500).json({
        success: false,
        message: '伺服器配置錯誤'
      });
    }

    console.log('🔑 JWT_SECRET 已設置，長度:', process.env.JWT_SECRET.length);

    // 生成 JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ 管理員登入成功:', {
      userId: user._id,
      userType: user.userType
    });

    // 返回用戶資訊和 token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('❌ 管理員登入錯誤:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: '登入過程發生錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login
}; 