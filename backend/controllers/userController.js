const { loadUsers } = require('../utils/userStorage');

const getCurrentUser = async (req, res) => {
  try {
    // 檢查是否已登入
    if (!req.user) {
      console.log('❌ 獲取用戶資料失敗: 未登入');
      return res.status(401).json({ success: false, message: '未登入' });
    }

    // 檢查用戶 ID
    if (!req.user.id) {
      console.log('❌ 獲取用戶資料失敗: 無效的用戶 ID');
      return res.status(401).json({ success: false, message: '無效的用戶 ID' });
    }

    const users = loadUsers();
    const currentUser = users.find((u) => u.id === req.user.id);

    if (!currentUser) {
      console.log('❌ 獲取用戶資料失敗: 用戶不存在');
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    // 移除敏感資料
    const { password, ...safeUser } = currentUser;
    console.log('✅ 用戶資料獲取成功:', safeUser.name);
    
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('❌ 獲取用戶資料錯誤:', error.message);
    res.status(500).json({
      success: false,
      message: '伺服器內部錯誤'
    });
  }
};

module.exports = {
  getCurrentUser
}; 