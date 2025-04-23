// 模擬驗證 JWT Token
const verifyToken = (req, res, next) => {
  // 從 Authorization 標頭獲取 token
  const authHeader = req.headers.authorization;
  
  // 檢查是否有 Authorization 標頭
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: '未授權的請求'
    });
  }
  
  // 檢查 Authorization 標頭格式是否為 "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: '未授權的請求'
    });
  }
  
  const token = parts[1];
  
  // 模擬驗證 token
  // 注意：在實際應用中，這裡應該要使用 JWT 庫來驗證 token
  if (!token.startsWith('mocked-jwt-token-')) {
    return res.status(401).json({
      success: false,
      message: '未授權的請求'
    });
  }
  
  // 模擬從 token 中解出用戶資料
  // 注意：在實際應用中，這裡應該要從 JWT 中解出用戶資料
  req.user = {
    name: '測試用戶',
    email: 'test@example.com'
  };
  
  next();
};

module.exports = {
  verifyToken
}; 