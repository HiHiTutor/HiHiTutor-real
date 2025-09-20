const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const CATEGORY_OPTIONS = require('../constants/categoryOptions');

// 獲取所有分類 - 優先從數據庫讀取，失敗時使用硬編碼備用
router.get('/', async (req, res) => {
  try {
    // 嘗試從數據庫獲取配置
    const categories = await Category.find({});
    
    if (categories.length > 0) {
      // 如果數據庫有數據，轉換為前台需要的格式
      const categoriesArray = categories.map(category => ({
        value: category.key,
        label: category.label,
        subjects: category.subjects || [],
        subCategories: category.subCategories || []
      }));
      
      console.log('✅ 從數據庫載入科目配置:', categoriesArray.length, '個分類');
      res.json(categoriesArray);
    } else {
      // 如果數據庫沒有數據，從文件讀取（作為備用）
      console.log('📁 數據庫無科目配置，使用文件備用');
      const categoriesArray = Object.entries(CATEGORY_OPTIONS).map(([value, category]) => ({
        value,
        label: category.label,
        subjects: category.subjects || [],
        subCategories: category.subCategories || []
      }));
      
      res.json(categoriesArray);
    }
  } catch (error) {
    console.error('❌ 載入科目配置時發生錯誤:', error);
    // 如果數據庫錯誤，使用文件備用
    const categoriesArray = Object.entries(CATEGORY_OPTIONS).map(([value, category]) => ({
      value,
      label: category.label,
      subjects: category.subjects || [],
      subCategories: category.subCategories || []
    }));
    
    res.json(categoriesArray);
  }
});

module.exports = router; 