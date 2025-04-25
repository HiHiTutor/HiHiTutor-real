const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminController');

// 獲取所有用戶
router.get('/users', getAllUsers);

module.exports = router; 