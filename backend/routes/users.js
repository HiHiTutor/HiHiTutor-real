const express = require('express');
const router = express.Router();
const { upgradeTutor, uploadAvatar, upload } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// 導師升級路由
router.put('/:id/upgrade', upgradeTutor);

// POST /api/users/:id/avatar - 上傳用戶頭像
router.post('/:id/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

module.exports = router; 