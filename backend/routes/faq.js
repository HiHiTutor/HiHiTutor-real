const express = require('express');
const router = express.Router();
const { getAllFAQs, getFAQsByCategory } = require('../controllers/faqController');

// 獲取所有常見問題
router.get('/', getAllFAQs);

// 獲取特定分類的常見問題
router.get('/category/:category', getFAQsByCategory);

module.exports = router; 