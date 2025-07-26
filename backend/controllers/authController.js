const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/UserRepository.js');
const crypto = require('crypto');
const { loadUsers, saveUsers } = require('../data/users');
const { getUserById } = require('../utils/userStorage');
const User = require('../models/User');
const RegisterToken = require('../models/RegisterToken');
const emailService = require('../services/email');
const { sendResetPasswordEmail } = require('../utils/emailService');
const ResetToken = require('../models/ResetToken');
const { generateUniqueTutorId } = require('../utils/tutorUtils');

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
  // 檢查是否為8位數字，且以5、6、8或9開頭
  return /^[5689]\d{7}$/.test(cleanPhone);
};

// 生成唯一 7 位 userId
async function generateUserId() {
  let nextUserId = '1000001';
  
  try {
    // 查找所有有效的數字 userId
    const allUsers = await User.find({
      userId: { 
        $exists: true,
        $ne: null,
        $ne: undefined,
        $regex: /^\d+$/
      }
    }).select('userId').lean();
    
    if (allUsers.length > 0) {
      // 找出最大的 userId
      const maxUserId = Math.max(...allUsers.map(user => parseInt(user.userId, 10)));
      if (!isNaN(maxUserId) && maxUserId > 0) {
        nextUserId = String(maxUserId + 1).padStart(7, '0');
      }
    }
  } catch (error) {
    console.error('Error generating userId:', error);
    // 如果出錯，使用預設值
  }
  
  console.log(`🔢 Generated userId: ${nextUserId}`);
  return nextUserId;
}

// 使用 generateUniqueTutorId 函數替代原有的 generateTutorId
async function generateTutorId() {
  return await generateUniqueTutorId(User);
}

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
    const isPhone = /^[5689]\d{7}$/.test(identifier);

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

    // 使用 bcrypt 比對密碼
    console.log("🔑 開始比對密碼...");
    console.log("📝 密碼信息：", {
      providedPassword: password,
      providedPasswordLength: password.length,
      storedHashedPassword: user.password,
      storedHashedPasswordLength: user.password.length
    });
    
    const match = await bcrypt.compare(password, user.password);
    console.log("🔑 密碼比對結果：", match ? "密碼正確" : "密碼錯誤");

    if (!match) {
      console.log("❌ 密碼錯誤");
      // 嘗試重新加密提供的密碼，看看結果是否匹配
      const testHash = await bcrypt.hash(password, 10);
      console.log("🔍 密碼診斷：", {
        providedPassword: password,
        testHash: testHash,
        testHashLength: testHash.length,
        storedHash: user.password,
        storedHashLength: user.password.length,
        doHashesMatch: testHash === user.password
      });
      
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
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        userType: user.userType
      },
      process.env.JWT_SECRET || 'your-secret-key',
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
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role || 'user'
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
    console.log("📥 註冊收到資料：", {
      ...req.body,
      password: '[HIDDEN]'
    });
    console.log("📥 請求標頭：", req.headers);
    console.log("📁 上傳的文件：", req.files);

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

    // 驗證 userType - 只允許 student 和 organization
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
      console.log('📝 創建新用戶...');
      const userId = await generateUserId();
      
      // 準備用戶資料 - 只包含必要欄位，不初始化 tutorId
      const userData = {
        name,
        email,
        phone,
        password, // 密碼會在 User model 的 pre('save') 中間件中被加密
        userType,
        role,
        userId
      };

      // ✅ 不初始化 tutorId 欄位，避免 MongoDB unique 衝突
      // tutorId 應只在日後升級為導師時，透過 generateUniqueTutorId() 方法生成並儲存

      const newUser = new User(userData);

      console.log('🔐 密碼信息（創建前）：', {
        originalPassword: password,
        passwordLength: password.length
      });

      // 保存用戶
      await newUser.save();

      console.log('🔐 密碼信息（創建後）：', {
        hashedPassword: newUser.password,
        hashedPasswordLength: newUser.password.length
      });

      // 如果是組織用戶，上傳文件到 S3
      if (userType === 'organization' && req.files) {
        try {
          console.log('📁 開始上傳組織文件到 S3...');
          const { PutObjectCommand } = require('@aws-sdk/client-s3');
          const { s3Client, BUCKET_NAME } = require('../config/s3');
          
          const uploadedFiles = {};
          
          // 上傳商業登記證
          if (req.files.businessRegistration && req.files.businessRegistration[0]) {
            const businessFile = req.files.businessRegistration[0];
            const businessKey = `uploads/organization-docs/${newUser._id}/business-registration-${Date.now()}-${businessFile.originalname}`;
            
            const businessCommand = new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: businessKey,
              Body: businessFile.buffer,
              ContentType: businessFile.mimetype
            });
            
            await s3Client.send(businessCommand);
            uploadedFiles.businessRegistration = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${businessKey}`;
            console.log('✅ 商業登記證上傳成功:', uploadedFiles.businessRegistration);
          }
          
          // 上傳地址證明
          if (req.files.addressProof && req.files.addressProof[0]) {
            const addressFile = req.files.addressProof[0];
            const addressKey = `uploads/organization-docs/${newUser._id}/address-proof-${Date.now()}-${addressFile.originalname}`;
            
            const addressCommand = new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: addressKey,
              Body: addressFile.buffer,
              ContentType: addressFile.mimetype
            });
            
            await s3Client.send(addressCommand);
            uploadedFiles.addressProof = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${addressKey}`;
            console.log('✅ 地址證明上傳成功:', uploadedFiles.addressProof);
          }
          
          // 更新用戶資料，添加文件 URL
          newUser.organizationDocuments = uploadedFiles;
          await newUser.save();
          console.log('✅ 組織文件 URL 已保存到用戶資料');
          
        } catch (uploadError) {
          console.error('❌ 文件上傳失敗:', uploadError);
          // 不阻止註冊流程，但記錄錯誤
        }
      }

      // 標記註冊令牌為已使用
      tokenData.isUsed = true;
      await tokenData.save();

      // 生成 JWT token
      console.log("🔑 生成 JWT token...");
      const jwtToken = jwt.sign(
        { 
          id: newUser._id, 
          email: newUser.email,
          phone: newUser.phone 
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
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          userType: newUser.userType,
          status: newUser.status
        }
      });

    } catch (error) {
      console.error("❌ 註冊錯誤:", error);
      return res.status(500).json({
        success: false,
        message: "註冊過程發生錯誤，請稍後再試"
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
const getCurrentUser = async (req, res) => {
  try {
    console.log('[getCurrentUser] 開始獲取用戶資料');
    console.log('[getCurrentUser] req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      console.log('[getCurrentUser] ❌ 未登入或無效 Token');
      return res.status(401).json({ success: false, message: '未登入' });
    }
    
    console.log('[getCurrentUser] 正在查找用戶 ID:', req.user.id);
    const user = await User.findById(req.user.id);
    console.log('[getCurrentUser] 找到用戶:', user);
    
    if (!user) {
      console.log('[getCurrentUser] ❌ 找不到用戶');
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }
    
    // 移除敏感資料並確保返回所有必要欄位
    const userData = {
      id: user._id,
      userId: user.userId,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || 'student',
      role: user.role || 'user',
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    console.log('[getCurrentUser] ✅ 返回用戶資料:', userData);
    res.json(userData);
  } catch (error) {
    console.error('[getCurrentUser] ❌ 獲取用戶資料錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 請求重設密碼（僅支援 email）
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: '請提供 email 地址' 
      });
    }

    // 驗證 email 格式
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: '請提供有效的 email 地址' 
      });
    }

    // 查找用戶
    const user = await User.findOne({ email });

    // 無論用戶是否存在，都返回成功訊息（避免帳號資訊洩漏）
    if (!user) {
      console.log(`📧 請求重設密碼：email ${email} 不存在，但仍返回成功訊息`);
      return res.status(200).json({ 
        success: true,
        message: '如果該 email 已註冊，重設密碼連結將發送到您的信箱'
      });
    }

    // 生成重設密碼 token（10分鐘有效期）
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘

    // 保存重設 token 到數據庫
    await RegisterToken.create({
      token: resetToken,
      email: user.email,
      expiresAt,
      isUsed: false,
      type: 'password-reset'
    });

    // 發送重設密碼email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`📧 重設密碼email已發送到: ${user.email}`);
    } catch (emailError) {
      console.error('❌ 發送重設密碼email失敗:', emailError);
      return res.status(500).json({ 
        success: false,
        message: '發送重設密碼email時發生錯誤，請稍後再試' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: '如果該 email 已註冊，重設密碼連結將發送到您的信箱'
    });
  } catch (error) {
    console.error('請求重設密碼處理失敗:', error);
    return res.status(500).json({
      success: false,
      message: '處理重設密碼請求時發生錯誤'
    });
  }
};

// 忘記密碼（支援 email 或電話）
const forgotPassword = async (req, res) => {
  console.log("🔥🔥🔥 進入 forgotPassword function，req.body =", req.body);
  // 允許 email、phone、account 或 identifier 直接傳入
  let { identifier, email, phone, account } = req.body;
  if (!identifier && (email || phone || account)) {
    identifier = email || phone || account;
  }
  console.log("💡 接收到的 identifier：", identifier);

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: '請提供 email 或電話號碼',
    });
  }

  // 查找用戶
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });

  // 檢查用戶是否存在
  if (!user) {
    console.log(`📧 請求重設密碼：identifier ${identifier} 不存在`);
    return res.status(404).json({
      success: false,
      message: '請填寫正確登入資訊'
    });
  }

  // 產生 reset token 並儲存到 MongoDB
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小時
  await ResetToken.create({ identifier, token, expiresAt });
  
  // 生成重設密碼連結
  const resetLink = `${process.env.FRONTEND_URL || 'https://hihitutor.com'}/reset-password?token=${token}`;
  console.log('🔗 Reset link:', resetLink);

  // 如果用戶有 email，發送重設密碼 email
  if (user.email) {
    try {
      await sendResetPasswordEmail(user.email, resetLink);
      console.log(`📧 重設密碼email已發送到: ${user.email}`);
    } catch (emailError) {
      console.error('❌ 發送重設密碼email失敗:', emailError);
      return res.status(500).json({
        success: false,
        message: '發送重設密碼email時發生錯誤，請稍後再試'
      });
    }
  }

  return res.json({
    success: true,
    message: '如果該帳號已註冊，重設密碼連結將發送到您的信箱',
    identifier,
    resetToken: token
  });
};

// 重設密碼
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '請提供 token 及新密碼'
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密碼長度必須至少為6個字符'
      });
    }
    // 查找 reset token
    const resetTokenData = await ResetToken.findOne({ token });
    if (!resetTokenData) {
      return res.status(400).json({
        success: false,
        message: '無效的 token'
      });
    }
    if (resetTokenData.expiresAt < new Date()) {
      await ResetToken.deleteOne({ _id: resetTokenData._id });
      return res.status(400).json({
        success: false,
        message: 'token 已過期'
      });
    }
    // 根據 identifier 找 user
    const user = await User.findOne({
      $or: [
        { email: resetTokenData.identifier },
        { phone: resetTokenData.identifier }
      ]
    });
    if (!user) {
      await ResetToken.deleteOne({ _id: resetTokenData._id });
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }
    // hash 新密碼
    console.log('🔑 開始重設密碼...');
    console.log('📝 重設密碼信息：', {
      newPassword: newPassword,
      passwordLength: newPassword.length,
      userEmail: user.email,
      userPhone: user.phone
    });
    
    console.log('🔐 準備更新密碼...');
    
    const oldPassword = user.password;
    user.password = newPassword; // 設為明文，等 pre-save middleware 處理
    await user.save();
    
    console.log('✅ 密碼更新成功：', {
      oldHash: oldPassword,
      newHash: user.password,
      updatedAt: user.updatedAt
    });
    
    // 刪除 reset token
    await ResetToken.deleteOne({ _id: resetTokenData._id });
    return res.json({
      success: true,
      message: '密碼已成功重設'
    });
  } catch (error) {
    console.error('重設密碼失敗:', error);
    return res.status(500).json({
      success: false,
      message: '重設密碼時發生錯誤'
    });
  }
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
    console.log('[getMe] 用戶完整資料:', JSON.stringify(user, null, 2));
    console.log('[getMe] userId 欄位:', user?.userId);
    
    if (!user) {
      console.log('[getMe] ❌ 找不到用戶');
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }
    
    // 移除敏感資料並確保返回所有必要欄位
    const { password, ...safeUser } = user;
    const userData = {
      id: safeUser.id,
      userId: safeUser.userId,
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

  console.log('[DEBUG] user in getProfile =', user);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user._id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
};

// 發送驗證碼
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
    if (!/^[456789]\d{7}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的香港電話號碼（8碼，4、5、6、7、8或9開頭）'
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

    // 檢查是否在 90 秒內重複發送
    const recentToken = await RegisterToken.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 90000) } // 90 秒內
    }).sort({ createdAt: -1 });

    if (recentToken) {
      const timeLeft = Math.ceil((90000 - (Date.now() - recentToken.createdAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `請等待 ${timeLeft} 秒後再重新發送驗證碼`
      });
    }

    // 生成 6 位數字驗證碼
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 準備發送驗證碼 ${code} 到 ${phone}`);

    // 生成臨時令牌
    const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 600000); // 10 分鐘後過期

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

    // 使用 SMS.to 發送驗證碼
    try {
      const smsService = require('../services/smsService');
      const formattedPhone = smsService.formatHongKongPhone(phone);
      
      await smsService.sendVerificationSMS(formattedPhone, code);
      console.log('✅ SMS.to 發送成功');
    } catch (smsError) {
      console.error('❌ SMS.to 發送失敗:', smsError);
      // 即使 SMS 發送失敗，也保留驗證碼記錄，但返回錯誤
      return res.status(500).json({
        success: false,
        message: 'SMS 發送失敗，請稍後再試'
      });
    }

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

// 驗證驗證碼
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
    const expiresAt = new Date(Date.now() + 600000); // 10 分鐘後過期

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

// 更新用戶資料
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, token, password } = req.body;

    // 獲取當前用戶
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 檢查電話是否被其他用戶使用
    if (phone && phone !== user.phone) {
      const existingUserByPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: '此電話號碼已被其他用戶使用'
        });
      }

      // 驗證電話驗證碼
      if (!token) {
        return res.status(400).json({
          success: false,
          message: '更新電話號碼需要驗證碼'
        });
      }

      const tokenData = await RegisterToken.findOne({ token });
      if (!tokenData || tokenData.phone !== phone || tokenData.isUsed || Date.now() > tokenData.expiresAt) {
        return res.status(400).json({
          success: false,
          message: '驗證碼無效或已過期'
        });
      }

      // 標記 token 為已使用
      tokenData.isUsed = true;
      await tokenData.save();
    }

    // 檢查郵箱是否被其他用戶使用
    if (email && email !== user.email) {
      const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: '此電子郵件已被其他用戶使用'
        });
      }
    }

    // 更新用戶資料
    const updates = {};
    
    // 驗證姓名格式（防止電話號碼濫用）
    if (name) {
      const trimmedName = name.trim();
      
      // 檢查是否包含數字
      if (/[0-9]/.test(trimmedName)) {
        return res.status(400).json({
          success: false,
          message: '姓名不能包含數字'
        });
      }
      
      // 檢查是否為電話號碼格式
      if (
        /^[0-9+\-\s()]+$/.test(trimmedName) || // 純數字和電話符號
        /^\d{8,}$/.test(trimmedName.replace(/[\s\-\(\)]/g, '')) || // 8位以上數字
        /^\+?[\d\s\-\(\)]{8,}$/.test(trimmedName) // 國際電話格式
      ) {
        return res.status(400).json({
          success: false,
          message: '姓名不能是電話號碼格式'
        });
      }
      
      // 檢查是否為常見的電話號碼關鍵字
      const phoneKeywords = ['電話', 'phone', 'tel', 'call', 'contact', '聯絡', '聯繫'];
      if (phoneKeywords.some(keyword => trimmedName.toLowerCase().includes(keyword))) {
        return res.status(400).json({
          success: false,
          message: '姓名不能包含電話相關關鍵字'
        });
      }
      
      updates.name = trimmedName;
    }
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    
    // 處理密碼更新
    if (password) {
      // 驗證密碼長度
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '密碼長度必須至少為6個字符'
        });
      }
      
      // 加密新密碼
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    return res.json({
      success: true,
      message: '用戶資料更新成功',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        userType: updatedUser.userType,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    return res.status(500).json({
      success: false,
      message: '更新用戶資料時發生錯誤'
    });
  }
};

// 申請升級為導師
const requestTutorUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    if (user.userType === 'tutor' || user.tutorProfile?.applicationStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: '您已經是導師或已申請升級'
      });
    }

    // 自動生成 tutorId
    if (!user.tutorId) {
      user.tutorId = await generateTutorId();
    }
    // 設置升級申請狀態
    user.tutorProfile = {
      ...user.tutorProfile,
      applicationStatus: 'pending'
    };
    await user.save();
    return res.json({
      success: true,
      message: '升級申請已提交',
      tutorId: user.tutorId
    });
  } catch (error) {
    console.error('申請升級導師失敗:', error);
    return res.status(500).json({
      success: false,
      message: '申請升級導師時發生錯誤'
    });
  }
};

// 驗證密碼
const verifyPassword = async (req, res) => {
  try {
    console.log('📥 驗證密碼請求');
    
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: '請提供目前的密碼'
      });
    }

    // 獲取用戶資料
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 驗證密碼
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '密碼不正確'
      });
    }

    res.json({
      success: true,
      message: '密碼驗證成功'
    });
  } catch (error) {
    console.error('❌ 驗證密碼時發生錯誤：', error);
    res.status(500).json({
      success: false,
      message: '驗證密碼時發生錯誤',
      error: error.message
    });
  }
};

// 在文件結尾，確保新增的函數有 export
module.exports = {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  requestPasswordReset,
  forgotPassword,
  resetPassword,
  getMe,
  getProfile,
  sendVerificationCode,
  verifyCode,
  updateUserProfile,
  requestTutorUpgrade,
  verifyPassword
}; 