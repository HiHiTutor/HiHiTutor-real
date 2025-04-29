const { loadUsers } = require('../utils/userStorage');

const verifyAdmin = (req, res, next) => {
  try {
    // 檢查是否已登入
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未登入'
      });
    }

    // 載入用戶資料
    const users = loadUsers();
    const currentUser = users.find(u => u.id === req.user.id);

    // 檢查是否為管理員
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理員權限'
      });
    }

    next();
  } catch (error) {
    console.error('驗證管理員權限失敗:', error);
    res.status(500).json({
      success: false,
      message: '驗證管理員權限失敗'
    });
  }
};

module.exports = {
  verifyAdmin
}; 