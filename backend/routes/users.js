const express = require('express');
const router = express.Router();
const { upgradeTutor } = require('../controllers/userController');

// 導師升級路由
router.put('/:id/upgrade', upgradeTutor);

module.exports = router; 