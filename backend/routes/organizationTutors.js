const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getOrganizationTutors,
  createOrganizationTutor,
  updateOrganizationTutor,
  deleteOrganizationTutor,
  toggleTutorPublic,
  getOrganizationSubscription
} = require('../controllers/organizationTutorController');

// 檢查是否為機構用戶的中間件
const isOrganization = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '未經過身份驗證' });
  }

  if (req.user.userType !== 'organization') {
    return res.status(403).json({ message: '只有機構用戶可以使用此功能' });
  }

  next();
};

// 獲取機構的所有導師
router.get('/', verifyToken, isOrganization, getOrganizationTutors);

// 創建新的機構導師
router.post('/', verifyToken, isOrganization, createOrganizationTutor);

// 更新機構導師
router.put('/:tutorId', verifyToken, isOrganization, updateOrganizationTutor);

// 刪除機構導師
router.delete('/:tutorId', verifyToken, isOrganization, deleteOrganizationTutor);

// 切換導師公開狀態
router.patch('/:tutorId/toggle-public', verifyToken, isOrganization, toggleTutorPublic);

// 獲取機構訂閱信息
router.get('/subscription', verifyToken, isOrganization, getOrganizationSubscription);

module.exports = router; 