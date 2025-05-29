const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供帳號和密碼'
      });
    }

    // 使用 email 或 phone 查找用戶
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ],
      userType: 'admin' // 確保只有管理員可以登入
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 驗證密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

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
    console.error('管理員登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入過程發生錯誤'
    });
  }
};

module.exports = {
  login
}; 