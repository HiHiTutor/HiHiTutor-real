const express = require('express');
const router = express.Router();
const { getCurrentUser, upgradeTutor } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const userRepository = require('../repositories/UserRepository');
const { getMe } = require('../controllers/authController');

// 只保留 /auth/me 路由
router.get('/auth/me', verifyToken, getMe);

// 導師升級路由
router.put('/users/:id/upgrade', upgradeTutor);

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

    // 更新用戶資料
    const updatedUser = userRepository.updateUser(userId, {
      name,
      phone,
      userType: userType || 'normal'
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

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