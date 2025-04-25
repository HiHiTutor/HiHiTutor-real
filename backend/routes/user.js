const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loadUsers, saveUsers } = require('../utils/userStorage');

router.get('/me', verifyToken, getCurrentUser);

// 更新用戶資料
router.put('/me/update', verifyToken, async (req, res) => {
  try {
    const { name, phone, userType } = req.body;
    const userId = req.user.id;

    // 驗證必要欄位
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: '姓名和電話為必填欄位'
      });
    }

    // 載入所有用戶
    const users = loadUsers();
    
    // 找到要更新的用戶
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 更新用戶資料
    const updatedUser = {
      ...users[userIndex],
      name,
      phone,
      userType: userType || 'personal'
    };

    // 保存更新後的用戶列表
    users[userIndex] = updatedUser;
    saveUsers(users);

    // 返回更新後的用戶資料（不包含密碼）
    const { password, ...safeUser } = updatedUser;
    res.json({
      success: true,
      message: '資料更新成功',
      data: safeUser
    });

  } catch (error) {
    console.error('更新用戶資料時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新資料時發生錯誤'
    });
  }
});

module.exports = router; 