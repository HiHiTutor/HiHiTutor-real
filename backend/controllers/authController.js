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

module.exports = {
  login
}; 