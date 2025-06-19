const jwt = require('jsonwebtoken');

function extractUserId(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = 'unknown';
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded._id || 'unknown';
    console.log('🔓 Token decoded:', decoded);
    console.log('🆔 Extracted userId:', req.userId);
  } catch (err) {
    console.error('❌ Token 解碼失敗:', err);
    req.userId = 'unknown';
  }
  next();
}

module.exports = extractUserId; 