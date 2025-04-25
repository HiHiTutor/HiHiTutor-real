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

// 檢查是否為有效的電子郵件格式
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 檢查是否為有效的電話號碼格式
const isValidPhone = (phone) => {
  return /^[0-9]{8,10}$/.test(phone);
};

// 用戶登入
const login = async (req, res) => {
  try {
    console.log('\n====== 👤 用戶登入請求 ======');
    console.log('📝 登入帳號:', req.body.account);
    
    const { account, password } = req.body;
    
    // 檢查是否提供帳號和密碼
    if (!account || !password) {
      console.log('❌ 登入失敗: 缺少帳號或密碼');
      console.log('==============================\n');
      return res.status(400).json({
        success: false,
        message: '請提供帳號和密碼'
      });
    }

    // 載入最新的用戶資料
    const users = loadUsers();

    // 尋找用戶 (支援 email 或 phone)
    const user = users.find(
      (u) => (u.email === account || u.phone === account) && u.password === password
    );
    
    // 如果找不到用戶或密碼錯誤
    if (!user) {
      console.log('❌ 登入失敗: 帳號或密碼錯誤');
      console.log('==============================\n');
      return res.status(401).json({
        success: false,
        message: '帳號或密碼錯誤'
      });
    }
    
    // 生成 JWT token
    const token = generateToken(user);
    
    // 登入成功日誌
    console.log('✅ 登入成功!');
    console.log('👤 用戶資料:');
    console.log('   ID:', user.id);
    console.log('   姓名:', user.name);
    console.log('   Email:', user.email);
    console.log('   電話:', user.phone);
    console.log('   註冊時間:', new Date(user.createdAt).toLocaleString());
    console.log('==============================\n');
    
    // 登入成功，回傳用戶資料和 token
    res.json({
      success: true,
      message: '登入成功',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('❌ 登入錯誤:', error);
    console.log('==============================\n');
    res.status(500).json({
      success: false,
      message: '伺服器內部錯誤'
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
      createdAt: Date.now()
    };

    // 儲存用戶資料
    users.push(newUser);
    saveUsers(users);  // 儲存到 JSON 檔案
    
    // 生成 JWT token
    const token = generateToken(newUser);
    console.log('[✅] 註冊成功:', { id: newUser.id, email: newUser.email });
    
    // 回傳註冊成功訊息
    res.status(201).json({
      success: true,
      message: '註冊成功',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('[❌] 註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '伺服器內部錯誤'
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