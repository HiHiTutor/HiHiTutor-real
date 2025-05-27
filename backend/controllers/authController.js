const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/UserRepository.js');
const crypto = require('crypto');
const { loadUsers, saveUsers } = require('../data/users');
const { getUserById } = require('../utils/userStorage');
const User = require('../models/User');

// 模擬 JWT token 生成
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 驗證 email 格式
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 驗證電話號碼格式
const isValidPhone = (phone) => {
  // 移除所有非數字字符
  const cleanPhone = phone.replace(/\D/g, '');
  // 檢查是否為8位數字
  return cleanPhone.length === 8;
};

// 用戶登入
const loginUser = async (req, res) => {
  try {
    console.log("📥 登入請求資料：", req.body);
    console.log("📥 請求標頭：", req.headers);

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log("❌ 缺少必要欄位：", { identifier: !identifier, password: !password });
      return res.status(400).json({
        success: false,
        message: '請提供帳號（電話或電郵）和密碼'
      });
    }

    // 檢查是否為 email 或電話
    const isEmail = identifier.includes('@');
    const isPhone = /^([69]\d{7})$/.test(identifier);

    if (!isEmail && !isPhone) {
      console.log("❌ 無效的帳號格式：", identifier);
      return res.status(400).json({
        success: false,
        message: '請提供有效的電郵或電話號碼'
      });
    }

    // 使用 $or 運算符同時查詢 email 和電話
    console.log("🔍 開始查找用戶...");
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    console.log("🔍 查找結果：", user ? "找到用戶" : "未找到用戶");

    if (!user) {
      console.log("❌ 找不到用戶：", identifier);
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 使用 User 模型的 comparePassword 方法比對密碼
    console.log("🔑 開始比對密碼...");
    const isMatch = await user.comparePassword(password);
    console.log("🔑 密碼比對結果：", isMatch ? "密碼正確" : "密碼錯誤");

    if (!isMatch) {
      console.log("❌ 密碼錯誤");
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 生成 JWT token
    console.log("🎟️ 生成 JWT token...");
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        phone: user.phone 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log("✅ JWT token 生成成功");

    // 返回成功響應
    console.log("🎉 登入成功，返回用戶資料");
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

// 用戶註冊
const register = async (req, res) => {
  try {
    console.log("📥 註冊收到資料：", req.body);
    console.log("📥 請求標頭：", req.headers);

    const { name, email, phone, password, userType, token } = req.body;
    const role = 'user'; // 統一預設 role 為 'user'

    // 檢查必要欄位
    if (!name || !email || !phone || !password || !userType || !token) {
      console.log("❌ 缺少必要欄位：", {
        name: !name,
        email: !email,
        phone: !phone,
        password: !password,
        userType: !userType,
        token: !token
      });
      return res.status(400).json({ 
        success: false, 
        message: '請提供所有必要資訊',
        missingFields: {
          name: !name,
          email: !email,
          phone: !phone,
          password: !password,
          userType: !userType,
          token: !token
        }
      });
    }

    // 檢查 token 是否有效
    const tokenData = tokenMap.get(token);
    if (!tokenData || tokenData.phone !== phone || tokenData.isUsed || Date.now() > tokenData.expiresAt) {
      console.log("❌ 無效的驗證碼：", { token, phone });
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ 無效的 email 格式：", email);
      return res.status(400).json({ 
        success: false, 
        message: '請提供有效的電子郵件地址' 
      });
    }

    // 驗證電話格式（香港手機號碼）
    if (!/^([69]\d{7})$/.test(phone)) {
      console.log("❌ 無效的電話格式：", phone);
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，9或6開頭）'
      });
    }

    // 驗證密碼長度
    if (password.length < 6) {
      console.log("❌ 密碼長度不足：", password.length);
      return res.status(400).json({ 
        success: false, 
        message: '密碼長度必須至少為6個字符' 
      });
    }

    // 驗證 userType
    if (!['student', 'organization'].includes(userType)) {
      console.log("❌ 無效的用戶類型：", userType);
      return res.status(400).json({ 
        success: false, 
        message: '無效的用戶類型，只能選擇學生或機構' 
      });
    }

    // 如果是組織用戶，檢查是否上傳了必要文件
    if (userType === 'organization') {
      if (!req.files?.businessRegistration || !req.files?.addressProof) {
        console.log("❌ 組織用戶缺少必要文件");
        return res.status(400).json({
          success: false,
          message: '請上傳商業登記證和地址證明'
        });
      }
    }

    console.log("✅ 資料驗證通過，準備進行註冊");

    try {
      // 檢查 email 是否已存在
      console.log("🔍 檢查 email 是否重複...");
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        console.log("❌ Email 已被註冊：", email);
        return res.status(400).json({
          success: false,
          message: '此電子郵件已被註冊'
        });
      }

      // 檢查電話是否已存在
      console.log("🔍 檢查電話是否重複...");
      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        console.log("❌ 電話已被註冊：", phone);
        return res.status(400).json({
          success: false,
          message: '此電話號碼已被註冊'
        });
      }

      // 創建新用戶
      console.log("📝 準備創建新用戶...");
      const newUser = new User({
        name,
        email,
        phone,
        password,
        role,
        userType,
        status: userType === 'organization' ? 'pending' : 'active',
        organizationDocuments: userType === 'organization' ? {
          businessRegistration: req.files.businessRegistration[0].path,
          addressProof: req.files.addressProof[0].path
        } : undefined
      });

      // 保存用戶資料到 MongoDB
      console.log("💾 準備保存用戶資料到 MongoDB...");
      const savedUser = await newUser.save();
      console.log("✅ 用戶資料保存成功！", savedUser);

      // 標記 token 為已使用
      tokenData.isUsed = true;
      tokenMap.set(token, tokenData);

      // 生成 JWT token
      console.log("🔑 生成 JWT token...");
      const jwtToken = jwt.sign(
        { 
          id: savedUser._id, 
          email: savedUser.email,
          phone: savedUser.phone 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log("✅ JWT token 生成成功！");

      // 返回成功響應
      console.log("🎉 註冊流程完成，返回成功響應");
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
  } catch (error) {
    console.error("❌ 註冊過程發生錯誤：", error);
    return res.status(500).json({
      success: false,
      message: '註冊過程發生錯誤，請稍後再試'
    });
  }
};

// 獲取用戶資料
const getUserProfile = (req, res) => {
  try {
    const user = userRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 移除敏感資料
    const { password, ...safeUser } = user;
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

// 獲取當前用戶資料
const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: '未登入或無效 Token' });
  }
  res.json({ user: req.user });
};

// 忘記密碼（支援 email 或電話）
const forgotPassword = (req, res) => {
  const { account } = req.body;
  if (!account) {
    return res.status(400).json({ message: '請提供 email 或電話號碼' });
  }

  const users = loadUsers();

  const isEmail = account.includes('@');
  const isPhone = /^\d{8}$/.test(account);

  let user;
  if (isEmail) {
    user = users.find((u) => u.email === account);
  } else if (isPhone) {
    user = users.find((u) => u.phone === account);
  } else {
    return res.status(400).json({ message: '格式錯誤，請輸入正確 email 或電話' });
  }

  if (!user) {
    return res.status(404).json({ message: '找不到該帳戶' });
  }

  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  saveUsers(users);

  console.log(`模擬寄送連結：http://localhost:3000/reset-password?token=${token}`);

  res.json({
    message: '密碼重設連結已發送（模擬）',
    token: token
  });
};

// 重設密碼
const resetPassword = (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: '請提供 token 及新密碼' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.resetToken === token);

  if (!user) {
    return res.status(400).json({ message: '無效或過期的 token' });
  }

  user.password = password;
  delete user.resetToken;
  saveUsers(users);

  res.json({ message: '密碼重設成功' });
};

// 新增：取得完整 user 資料
const getMe = async (req, res) => {
  try {
    console.log('[getMe] 開始獲取用戶資料');
    console.log('[getMe] req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      console.log('[getMe] ❌ 未登入或無效 Token');
      return res.status(401).json({ success: false, message: '未登入' });
    }
    
    console.log('[getMe] 正在查找用戶 ID:', req.user.id);
    const user = await userRepository.getUserById(req.user.id);
    console.log('[getMe] 找到用戶:', user);
    
    if (!user) {
      console.log('[getMe] ❌ 找不到用戶');
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }
    
    // 移除敏感資料並確保返回所有必要欄位
    const { password, ...safeUser } = user;
    const userData = {
      id: safeUser.id,
      name: safeUser.name || '',
      email: safeUser.email || '',
      phone: safeUser.phone || '',
      userType: safeUser.userType || 'normal',
      createdAt: safeUser.createdAt,
      updatedAt: safeUser.updatedAt
    };
    
    console.log('[getMe] ✅ 返回用戶資料:', userData);
    res.json(userData);
  } catch (error) {
    console.error('[getMe] ❌ 獲取用戶資料錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

const getProfile = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID from token' });
  }

  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { id, name, email, phone, role } = user;

  res.json({
    id,
    name,
    email,
    phone,
    role
  });
};

// 在文件結尾，確保 forgotPassword 有 export
module.exports = {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getMe,
  getProfile
}; 