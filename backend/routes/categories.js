const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById } = require('../controllers/categoryController');

// 獲取所有分類
router.get('/', getAllCategories);

// 獲取單個分類
router.get('/:id', getCategoryById);

module.exports = router; 