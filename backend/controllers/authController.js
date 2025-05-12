const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/UserRepository.js');
const crypto = require('crypto');
const { loadUsers, saveUsers } = require('../data/users');

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
    console.log('[登入嘗試]', req.body);

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供帳號（電話或電郵）和密碼'
      });
    }

    if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      return res.status(400).json({
        success: false,
        message: '請提供有效的電郵或電話號碼'
      });
    }

    const user = await userRepository.getUserByEmail(identifier) 
              || await userRepository.getUserByPhone(identifier);
    console.log('[找到用戶]', user);
    console.log('[DEBUG] user from repo:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 密碼比對
    console.log('[密碼比對]', {
      inputPassword: password,
      storedPassword: user.password,
      type: {
        input: typeof password,
        stored: typeof user.password
      }
    });

    // 檢查密碼是否為 bcrypt 加密格式
    const isHashed = user.password.startsWith('$2');
    let match = false;

    if (isHashed) {
      // 如果是加密密碼，使用 bcrypt 比對
      match = await bcrypt.compare(password, user.password);
    } else {
      // 如果是明文密碼，直接比對
      match = password === user.password;
    }

    console.log('[密碼比對結果]', match);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType
      },
      message: '登入成功'
    });
  } catch (error) {
    console.error('[❌登入錯誤]', error);
    return res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    });
  }
};

// 用戶註冊
const register = async (req, res) => {
  try {
    const { email, password, name, userType, phone } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({
        success: false,
        message: '請提供所有必要資訊'
      });
    }

    const users = await userRepository.getAllUsers();
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: '此電郵已被註冊'
      });
    }

    if (phone && users.some(u => u.phone === phone)) {
      return res.status(400).json({
        success: false,
        message: '此電話已被註冊'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      userType,
      phone: phone || '',
      upgraded: false,
      upgradeRequested: false,
      upgradeDocuments: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await userRepository.saveUsers(users);

    const token = jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        userType: newUser.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          userType: newUser.userType
        }
      },
      message: '註冊成功'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: '註冊時發生錯誤'
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: '未登入' });
    }
    const user = await userRepository.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 在文件結尾，確保 forgotPassword 有 export
module.exports = {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getMe
}; 