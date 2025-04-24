const users = require('../data/users');

// 模擬 JWT token 生成
const generateMockToken = () => {
  return 'mocked-jwt-token-' + Date.now();
};

// 用戶登入
const login = (req, res) => {
  const { email, password } = req.body;
  
  // 檢查是否提供 email 和 password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供 email 和 password'
    });
  }
  
  // 尋找符合的用戶
  const user = users.find(u => u.email === email && u.password === password);
  
  // 如果找不到用戶或密碼錯誤
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '帳號或密碼錯誤'
    });
  }
  
  // 登入成功，回傳用戶資料和 token
  res.json({
    success: true,
    message: '登入成功',
    token: generateMockToken(),
    user: {
      name: user.name,
      email: user.email
    }
  });
};

// 用戶註冊
const register = (req, res) => {
  // 從 Authorization header 讀取令牌
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '缺少註冊令牌'
    });
  }
  const token = authHeader.split(' ')[1];

  const { name, email, password } = req.body;
  
  // 檢查是否提供所有必要欄位
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供 name、email 和 password'
    });
  }
  
  // 檢查 email 是否已被註冊
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: '此 email 已被註冊'
    });
  }
  
  // 模擬註冊成功
  // 注意：在實際應用中，這裡應該要將用戶資料存入資料庫
  const newUser = {
    name,
    email,
    password
  };
  
  // 回傳註冊成功訊息
  res.status(201).json({
    success: true,
    message: '註冊成功',
    token: generateMockToken(),
    user: {
      name: newUser.name,
      email: newUser.email
    }
  });
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