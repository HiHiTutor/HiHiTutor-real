const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供有效的認證令牌' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('JWT 驗證失敗:', err.message);
    return res.status(401).json({ message: '無效的認證令牌' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '未經過身份驗證' });
  }

  if (req.user.userType !== 'admin' || req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' });
  }

  next();
};

module.exports = { verifyToken, isAdmin }; 