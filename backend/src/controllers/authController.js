const { loadUsers } = require('../utils/userStorage');
const User = require('../models/user');
const RegisterToken = require('../models/registerToken');

const loginUser = (req, res) => {
  // 登入邏輯
};

const register = (req, res) => {
  // 註冊邏輯
};

const getUserProfile = (req, res) => {
  // 獲取用戶資料邏輯
};

const getCurrentUser = (req, res) => {
  // 獲取當前用戶邏輯
};

const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '請提供註冊用的電郵地址' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: '查無此電郵帳戶' });
  }

  // 模擬發送密碼重設信
  return res.status(200).json({ message: '密碼重設連結已發送（模擬）' });
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