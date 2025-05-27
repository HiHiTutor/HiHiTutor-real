const User = require('../models/user');
const RegisterToken = require('../models/registerToken');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供帳號（電話或電郵）和密碼'
      });
    }

    // 檢查是否為 email 或電話
    const isEmail = identifier.includes('@');
    const isPhone = /^([69]\d{7})$/.test(identifier);

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的電郵或電話號碼'
      });
    }

    // 使用 $or 運算符同時查詢 email 和電話
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 使用 User 模型的 comparePassword 方法比對密碼
    const isMatch = await user.comparePassword(password);

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
        phone: user.phone 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.userType
      },
      message: '登入成功'
    });
  } catch (error) {
    console.error("❌ 登入過程發生錯誤：", error);
    return res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, userType, token } = req.body;
    const role = 'user'; // 統一預設 role 為 'user'

    // 檢查必要欄位
    if (!name || !email || !phone || !password || !userType || !token) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供所有必要資訊'
      });
    }

    // 檢查 token 是否有效
    const tokenData = await RegisterToken.findOne({ token });
    if (!tokenData || tokenData.phone !== phone || tokenData.isUsed || Date.now() > tokenData.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供有效的電子郵件地址' 
      });
    }

    // 驗證電話格式（香港手機號碼）
    if (!/^([69]\d{7})$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，9或6開頭）'
      });
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密碼長度必須至少為6個字符' 
      });
    }

    // 驗證 userType
    if (!['student', 'organization'].includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        message: '無效的用戶類型，只能選擇學生或機構' 
      });
    }

    // 檢查 email 是否已存在
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: '此電子郵件已被註冊'
      });
    }

    // 檢查電話是否已存在
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: '此電話號碼已被註冊'
      });
    }

    // 創建新用戶
    const newUser = new User({
      name,
      email,
      phone,
      password,
      role,
      userType,
      status: userType === 'organization' ? 'pending' : 'active'
    });

    // 保存用戶資料到 MongoDB
    const savedUser = await newUser.save();

    // 標記 token 為已使用
    tokenData.isUsed = true;
    await tokenData.save();

    // 生成 JWT token
    const jwtToken = jwt.sign(
      { 
        id: savedUser._id, 
        email: savedUser.email,
        phone: savedUser.phone 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: userType === 'organization' ? '註冊成功，等待管理員審核' : '註冊成功',
      token: jwtToken,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        userType: savedUser.userType,
        status: savedUser.status
      }
    });

  } catch (error) {
    console.error("❌ 註冊過程發生錯誤：", error);
    return res.status(500).json({
      success: false,
      message: '註冊過程發生錯誤，請稍後再試'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 移除敏感資料
    const { password, ...safeUser } = user.toObject();
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料時發生錯誤'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 移除敏感資料
    const { password, ...safeUser } = user.toObject();
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('獲取當前用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料時發生錯誤'
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: '請提供註冊用的電郵地址' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '查無此電郵帳戶' 
      });
    }

    // TODO: 實現密碼重設邏輯
    return res.status(200).json({ 
      success: true,
      message: '密碼重設連結已發送（模擬）' 
    });
  } catch (error) {
    console.error('忘記密碼處理失敗:', error);
    return res.status(500).json({
      success: false,
      message: '處理忘記密碼請求時發生錯誤'
    });
  }
};

const sendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: '請提供電話號碼'
      });
    }

    // 驗證電話格式（香港手機號碼）
    if (!/^([69]\d{7})$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，9或6開頭）'
      });
    }

    // 檢查電話是否已被註冊
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此電話號碼已被註冊',
        action: 'phone-exists',
        options: {
          loginUrl: '/login',
          resetUrl: '/forgot-password'
        }
      });
    }

    // 生成 6 位數字驗證碼
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 發送驗證碼 ${code} 到 ${phone}`);

    // 生成臨時令牌
    const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 300000); // 5 分鐘後過期

    // 保存驗證碼和令牌到數據庫
    const registerToken = await RegisterToken.create({
      token,
      phone,
      code,
      expiresAt,
      isUsed: false
    });

    console.log('✅ 驗證碼已保存到數據庫:', {
      token: registerToken.token,
      phone: registerToken.phone,
      code: registerToken.code,
      expiresAt: registerToken.expiresAt
    });

    // TODO: 實際發送 SMS 的邏輯
    // 這裡先模擬發送成功

    return res.status(200).json({
      success: true,
      message: '驗證碼已發送',
      token,
      code: process.env.NODE_ENV === 'development' ? code : undefined // 在開發環境中返回驗證碼
    });
  } catch (error) {
    console.error('發送驗證碼失敗:', error);
    return res.status(500).json({
      success: false,
      message: '發送驗證碼失敗，請稍後再試'
    });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '請提供電話號碼和驗證碼'
      });
    }

    // 查找該電話號碼的驗證碼記錄
    const tokenData = await RegisterToken.findOne({
      phone,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('🔍 查找驗證碼記錄:', {
      phone,
      code,
      found: !!tokenData,
      isUsed: tokenData?.isUsed,
      expiresAt: tokenData?.expiresAt,
      currentTime: new Date()
    });

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: '驗證碼無效或已過期'
      });
    }

    // 驗證碼驗證成功，生成新的註冊令牌
    const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 300000); // 5 分鐘後過期

    // 標記舊的驗證碼為已使用
    tokenData.isUsed = true;
    await tokenData.save();

    // 保存新的註冊令牌
    const newToken = await RegisterToken.create({
      token,
      phone,
      code: tokenData.code, // 保留原始驗證碼
      expiresAt,
      isUsed: false
    });

    console.log('✅ 驗證成功，生成新令牌:', {
      token: newToken.token,
      phone: newToken.phone,
      expiresAt: newToken.expiresAt
    });

    return res.status(200).json({
      success: true,
      message: '驗證成功',
      token
    });
  } catch (error) {
    console.error('驗證碼驗證失敗:', error);
    return res.status(500).json({
      success: false,
      message: '驗證碼驗證失敗，請稍後再試'
    });
  }
};

module.exports = {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword,
  sendVerificationCode,
  verifyCode
}; 