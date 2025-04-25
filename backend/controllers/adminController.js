const { loadUsers } = require('../utils/userStorage');

// 獲取所有用戶
exports.getAllUsers = (req, res) => {
  try {
    console.log('[API] GET /api/admin/users 收到請求');
    const users = loadUsers(); // ✅ 加上括號
    const sanitizedUsers = users.map(({ id, name, email, phone, userType }) => ({
      id, name, email, phone, userType
    }));

    console.log(`[API] GET /api/admin/users 回應成功，共 ${sanitizedUsers.length} 筆資料`);
    res.status(200).json({
      success: true,
      data: {
        users: sanitizedUsers,
        total: sanitizedUsers.length
      }
    });
  } catch (error) {
    console.error('[❌] 無法取得用戶列表:', error);
    res.status(500).json({
      success: false,
      message: '伺服器內部錯誤'
    });
  }
}; 