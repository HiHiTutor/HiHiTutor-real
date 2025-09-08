const { ensureConnection } = require('../config/db');

// 數據庫連接中間件 - 確保在處理請求前數據庫已連接
const ensureDatabaseConnection = async (req, res, next) => {
  try {
    // 對於不需要數據庫的請求，直接跳過
    const skipPaths = ['/api/health', '/api/test'];
    if (skipPaths.includes(req.path)) {
      return next();
    }

    // 確保數據庫連接
    await ensureConnection();
    console.log('✅ Database connection ensured for request:', req.method, req.path);
    next();
  } catch (error) {
    console.error('❌ Database connection failed for request:', req.method, req.path, error);
    res.status(503).json({
      success: false,
      message: 'Database not ready',
      error: 'MongoDB connection failed',
      details: error.message
    });
  }
};

module.exports = { ensureDatabaseConnection };
