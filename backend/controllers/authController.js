const { loadUsers, saveUsers } = require('../utils/userStorage');
const jwt = require('jsonwebtoken');

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
  const phoneRegex = /^[0-9]{8,}$/;
  return phoneRegex.test(phone);
};

// 用戶登入
const login = async (req, res) => {
  try {
    console.log('[🔑] 處理登入請求:', req.body);
    const { account, password } = req.body;
    
    // 檢查是否提供帳號和密碼
    if (!account || !password) {
      console.log('[❌] 登入失敗: 缺少帳號或密碼');
      return res.status(400).json({
        success: false,
        message: '請提供帳號和密碼'
      });
    }

    // 載入用戶資料
    const users = loadUsers();
    
    // 查找用戶（支持 email 或電話登入）
    const user = users.find(u => 
      (u.email === account || u.phone === account) && 
      u.password === password
    );

    if (!user) {
      console.log('[❌] 登入失敗: 帳號或密碼錯誤');
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }

    // 生成 JWT token
    const token = generateToken(user);
    
    // 移除敏感資料
    const { password: _, ...safeUser } = user;
    
    console.log('[✅] 登入成功:', { id: user.id, email: user.email });
    
    res.json({
      success: true,
      message: '登入成功',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[❌] 登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    });
  }
};

// 用戶註冊
const register = async (req, res) => {
  try {
    console.log('[📝] 處理註冊請求:', req.body);
    const { name, email, password, phone } = req.body;
    
    // 檢查是否提供所有必要欄位
    if (!name || !email || !password || !phone) {
      console.log('[❌] 註冊失敗: 缺少必要欄位');
      return res.status(400).json({
        success: false,
        message: '請提供所有必要欄位'
      });
    }

    // 檢查 email 和 phone 格式
    if (!isValidEmail(email)) {
      console.log('[❌] 註冊失敗: 無效的電子郵件格式');
      return res.status(400).json({
        success: false,
        message: '無效的電子郵件格式'
      });
    }

    if (!isValidPhone(phone)) {
      console.log('[❌] 註冊失敗: 無效的電話號碼格式');
      return res.status(400).json({
        success: false,
        message: '無效的電話號碼格式'
      });
    }
    
    // 載入最新的用戶資料
    const users = loadUsers();
    
    // 檢查 email 或 phone 是否已被註冊
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      console.log('[❌] 註冊失敗: 帳號已被註冊');
      return res.status(400).json({
        success: false,
        message: '此帳號已被註冊'
      });
    }
    
    // 創建新用戶
    const newUser = {
      id: `user_${Date.now()}`,  // 生成唯一 ID
      name,
      email,
      password,
      phone,
      role: 'student',  // 預設角色為學生
      createdAt: Date.now()
    };

    // 儲存用戶資料
    users.push(newUser);
    saveUsers(users);  // 儲存到 JSON 檔案
    
    // 生成 JWT token
    const token = generateToken(newUser);
    
    // 移除敏感資料
    const { password: _, ...safeUser } = newUser;
    
    console.log('[✅] 註冊成功:', { id: newUser.id, email: newUser.email });
    
    res.status(201).json({
      success: true,
      message: '註冊成功',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[❌] 註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊時發生錯誤'
    });
  }
};

// 獲取用戶資料
const getUserProfile = (req, res) => {
  // 從中介層獲取用戶資料
  const user = req.user;
  
  res.json({
    success: true,
    user
  });
};

module.exports = {
  login,
  register,
  getUserProfile
}; 