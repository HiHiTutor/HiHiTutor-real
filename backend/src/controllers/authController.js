const User = require('../models/user');
const RegisterToken = require('../models/registerToken');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
  try {
    console.log('📥 登入請求資料：', {
      identifier: req.body.identifier,
      password: '[HIDDEN]'  // 不要在日誌中顯示密碼
    });

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log('❌ 缺少必要資料:', {
        hasIdentifier: !!identifier,
        hasPassword: !!password
      });
      return res.status(400).json({
        success: false,
        message: '請提供帳號（電話或電郵）和密碼'
      });
    }

    // 檢查是否為 email 或電話
    const isEmail = identifier.includes('@');
    const isPhone = /^([69]\d{7})$/.test(identifier);

    if (!isEmail && !isPhone) {
      console.log('❌ 無效的帳號格式:', {
        identifier,
        isEmail,
        isPhone
      });
      return res.status(400).json({
        success: false,
        message: '請提供有效的電郵或電話號碼'
      });
    }

    console.log('🔍 開始查找用戶...');
    // 使用 $or 運算符同時查詢 email 和電話
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    console.log('🔍 查找結果：', {
      found: !!user,
      userId: user?._id,
      userEmail: user?.email,
      userPhone: user?.phone,
      hashedPassword: user?.password?.substring(0, 10) + '...',
      passwordLength: user?.password?.length
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 使用 User 模型的 comparePassword 方法比對密碼
    console.log('🔑 開始比對密碼...', {
      inputPasswordLength: password.length,
      hashedPasswordLength: user.password.length
    });
    
    const isMatch = await user.comparePassword(password);
    
    console.log('🔑 密碼比對結果：', {
      isMatch,
      bcryptVersion: await bcrypt.getRounds(user.password)
    });

    if (!isMatch) {
      console.log('❌ 密碼錯誤');
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 生成 JWT token
    console.log('🔑 生成 JWT token...');
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        phone: user.phone 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ 登入成功');
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
    console.error('❌ 登入過程發生錯誤：', error);
    return res.status(500).json({
      success: false,
      message: '登入過程發生錯誤，請稍後再試'
    });
  }
};

const register = async (req, res) => {
  try {
    console.log("📥 註冊收到資料：", {
      ...req.body,
      password: '[HIDDEN]'
    });
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
    const tokenData = await RegisterToken.findOne({ token });
    console.log('🔍 查找註冊令牌:', {
      token,
      found: !!tokenData,
      phone: tokenData?.phone,
      isUsed: tokenData?.isUsed,
      expiresAt: tokenData?.expiresAt,
      currentTime: new Date()
    });

    if (!tokenData) {
      console.log('❌ 找不到令牌:', token);
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    if (tokenData.phone !== phone) {
      console.log('❌ 電話號碼不匹配:', {
        tokenPhone: tokenData.phone,
        requestPhone: phone
      });
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    if (tokenData.isUsed) {
      console.log('❌ 令牌已被使用:', token);
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    if (Date.now() > tokenData.expiresAt) {
      console.log('❌ 令牌已過期:', {
        token,
        expiresAt: tokenData.expiresAt,
        currentTime: new Date()
      });
      return res.status(400).json({ 
        success: false, 
        message: '驗證碼無效或已過期' 
      });
    }

    console.log('✅ 令牌驗證通過:', {
      token,
      phone: tokenData.phone,
      expiresAt: tokenData.expiresAt
    });

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
    if (!/^[456789]\d{7}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，4、5、6、7、8或9開頭）'
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

      // 創建新用戶（密碼會在 User 模型的 pre('save') 中間件中自動加密）
      console.log("📝 準備創建新用戶...");
      const newUser = new User({
        name,
        email,
        phone,
        password, // 直接使用原始密碼，讓 User 模型處理加密
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
      console.log("✅ 用戶資料保存成功！", {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        userType: savedUser.userType,
        status: savedUser.status
      });

      // 標記 token 為已使用
      tokenData.isUsed = true;
      await tokenData.save();

      // 生成 JWT token
      console.log("🔑 生成 JWT token...");
      const jwtToken = jwt.sign(
        { 
          id: savedUser._id, 
          email: savedUser.email,
          phone: savedUser.phone 
        },
        process.env.JWT_SECRET || 'your-secret-key',
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
    console.log('📥 收到發送驗證碼請求:', {
      body: req.body,
      headers: req.headers
    });

    const { phone } = req.body;

    // 檢查電話號碼是否存在
    if (!phone) {
      console.log('❌ 缺少電話號碼');
      return res.status(400).json({
        success: false,
        message: '請提供電話號碼'
      });
    }

    // 格式化電話號碼（移除空格和特殊字符）
    const formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');

    // 驗證電話格式（香港手機號碼）
    if (!/^[456789]\d{7}$/.test(formattedPhone)) {
      console.log('❌ 無效的電話格式:', formattedPhone);
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，4、5、6、7、8或9開頭）'
      });
    }

    // 檢查電話是否已被註冊
    const existingUser = await User.findOne({ phone: formattedPhone });
    if (existingUser) {
      console.log('❌ 電話已被註冊:', formattedPhone);
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

    // 檢查是否有未過期的驗證碼
    const existingToken = await RegisterToken.findOne({
      phone: formattedPhone,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingToken) {
      const timeLeft = Math.ceil((existingToken.expiresAt - new Date()) / 1000);
      console.log('⚠️ 已存在未過期的驗證碼:', {
        phone: formattedPhone,
        timeLeft: `${timeLeft}秒`
      });
      return res.status(400).json({
        success: false,
        message: `請等待 ${timeLeft} 秒後再重新發送驗證碼`
      });
    }

    // 生成 6 位數字驗證碼
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 生成驗證碼: ${code} 到 ${formattedPhone}`);

    // 設置過期時間（5分鐘）
    const expiresAt = new Date(Date.now() + 300000);

    // 保存驗證碼到數據庫
    const registerToken = await RegisterToken.create({
      phone: formattedPhone,
      code,
      expiresAt,
      isUsed: false
    });

    console.log('✅ 驗證碼已保存到數據庫:', {
      phone: registerToken.phone,
      code: registerToken.code,
      expiresAt: registerToken.expiresAt
    });

    // TODO: 實際發送 SMS 的邏輯
    // 這裡先模擬發送成功

    return res.status(200).json({
      success: true,
      message: '驗證碼已發送',
      code: process.env.NODE_ENV === 'development' ? code : undefined // 在開發環境中返回驗證碼
    });
  } catch (error) {
    console.error('❌ 發送驗證碼失敗:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: '發送驗證碼失敗，請稍後再試',
      debug: {
        error: error.message,
        mongoState: mongoose.connection.readyState
      }
    });
  }
};

const verifyCode = async (req, res) => {
  try {
    console.log('📥 收到驗證碼驗證請求:', {
      body: req.body,
      headers: req.headers
    });

    const { phone, code } = req.body;

    // 檢查必要字段
    if (!phone || !code) {
      console.log('❌ 缺少必要字段:', {
        hasPhone: !!phone,
        hasCode: !!code
      });
      return res.status(400).json({
        success: false,
        message: '請提供電話號碼和驗證碼'
      });
    }

    // 格式化電話號碼和驗證碼
    const formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const formattedCode = code.replace(/\s+/g, '');

    // 驗證電話格式
    if (!/^[456789]\d{7}$/.test(formattedPhone)) {
      console.log('❌ 無效的電話格式:', formattedPhone);
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，4、5、6、7、8或9開頭）'
      });
    }

    // 驗證碼格式檢查
    if (!/^\d{6}$/.test(formattedCode)) {
      console.log('❌ 無效的驗證碼格式:', formattedCode);
      return res.status(400).json({
        success: false,
        message: '請提供有效的6位數字驗證碼'
      });
    }

    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，嘗試重新連接...');
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ 成功重新連接到 MongoDB');
      } catch (dbError) {
        console.error('❌ MongoDB 連接失敗:', {
          error: dbError.message,
          code: dbError.code,
          name: dbError.name
        });
        return res.status(500).json({
          success: false,
          message: '資料庫連接失敗',
          debug: {
            error: dbError.message,
            mongoState: mongoose.connection.readyState
          }
        });
      }
    }

    // 查找該電話號碼的驗證碼記錄
    console.log('🔍 查找驗證碼記錄...');
    const tokenData = await RegisterToken.findOne({
      phone: formattedPhone,
      code: formattedCode,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('🔍 查找驗證碼記錄結果:', {
      phone: formattedPhone,
      code: formattedCode,
      found: !!tokenData,
      isUsed: tokenData?.isUsed,
      expiresAt: tokenData?.expiresAt,
      currentTime: new Date()
    });

    if (!tokenData) {
      // 檢查是否有過期的驗證碼
      const expiredToken = await RegisterToken.findOne({
        phone: formattedPhone,
        code: formattedCode,
        isUsed: false
      }).sort({ createdAt: -1 });

      if (expiredToken) {
        console.log('⚠️ 找到過期的驗證碼:', {
          expiresAt: expiredToken.expiresAt,
          currentTime: new Date()
        });
        return res.status(400).json({
          success: false,
          message: '驗證碼已過期，請重新發送'
        });
      }

      return res.status(400).json({
        success: false,
        message: '驗證碼無效，請重新輸入'
      });
    }

    // 驗證碼驗證成功，生成新的註冊令牌
    const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 300000); // 5 分鐘後過期

    // 標記舊的驗證碼為已使用
    console.log('✏️ 標記舊的驗證碼為已使用...');
    tokenData.isUsed = true;
    await tokenData.save();

    // 保存新的註冊令牌
    console.log('✏️ 保存新的註冊令牌...');
    const newToken = await RegisterToken.create({
      token,
      phone: formattedPhone,
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
    console.error('❌ 驗證碼驗證失敗:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: '驗證碼驗證失敗，請稍後再試',
      debug: {
        error: error.message,
        mongoState: mongoose.connection.readyState
      }
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