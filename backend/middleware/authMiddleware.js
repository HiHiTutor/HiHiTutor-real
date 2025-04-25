const jwt = require('jsonwebtoken');

// 模擬驗證 JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ 驗證失敗: 缺少 Bearer token');
    return res.status(401).json({ success: false, message: '未授權的請求' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 確保解碼內容包含必要欄位
    if (!decoded.id || !decoded.email) {
      console.log('❌ 驗證失敗: Token 內容不完整');
      return res.status(401).json({ success: false, message: '無效的 token 內容' });
    }

    // 附加解碼內容到 req.user
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ 驗證失敗:', err.message);
    return res.status(401).json({ success: false, message: '無效的 token' });
  }
};

module.exports = { verifyToken }; 