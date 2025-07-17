const express = require('express');
const router = express.Router();
const { verifyToken, isSuperAdmin } = require('../middleware/authMiddleware');
const {
  createSuperAdmin,
  getAllSuperAdmins,
  updateSuperAdmin,
  deleteSuperAdmin
} = require('../controllers/superAdminController');

// 所有路由都需要超級管理員權限
router.use(verifyToken);
router.use(isSuperAdmin);

// 超級管理員管理路由
router.post('/', createSuperAdmin);
router.get('/', getAllSuperAdmins);
router.put('/:id', updateSuperAdmin);
router.delete('/:id', deleteSuperAdmin);

module.exports = router; 