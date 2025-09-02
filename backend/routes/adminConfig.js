const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Category = require('../models/Category');

// 获取科目配置
router.get('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    // 嘗試從數據庫獲取配置
    const categories = await Category.find({});
    
    if (categories.length > 0) {
      // 如果數據庫有數據，轉換為原來的格式
      const categoriesObject = categories.reduce((acc, category) => {
        acc[category.key] = {
          label: category.label,
          subjects: category.subjects || [],
          subCategories: category.subCategories || []
        };
        return acc;
      }, {});
      
      res.json(categoriesObject);
    } else {
      // 如果數據庫沒有數據，從文件讀取（作為備用）
      try {
        const categoryOptions = require('../constants/categoryOptions');
        res.json(categoryOptions);
      } catch (fileError) {
        console.log('無法從文件讀取科目配置，返回空配置');
        res.json({});
      }
    }
  } catch (error) {
    console.error('Error loading categories from database:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// 更新科目配置
router.post('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const { categories } = req.body;
    console.log('📥 接收到科目配置更新:', Object.keys(categories));
    
    // 清空現有配置
    await Category.deleteMany({});
    
    // 將新的配置保存到數據庫
    const categoryDocuments = Object.entries(categories).map(([key, category]) => ({
      key,
      label: category.label,
      subjects: category.subjects || [],
      subCategories: category.subCategories || []
    }));
    
    const savedCategories = await Category.insertMany(categoryDocuments);
    console.log('✅ 成功保存科目配置到數據庫:', savedCategories.length, '個分類');
    
    res.json({ 
      message: 'Categories updated successfully',
      savedCount: savedCategories.length
    });
  } catch (error) {
    console.error('Error updating categories in database:', error);
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

// 获取地区配置
router.get('/regions', verifyToken, isAdmin, async (req, res) => {
  try {
    const regionOptions = require('../constants/regionOptions');
    res.json(regionOptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load regions' });
  }
});

// 更新地区配置
router.post('/regions', verifyToken, isAdmin, async (req, res) => {
  try {
    const { regions } = req.body;
    console.log('📥 接收到地區配置更新:', regions?.length, '個地區');
    
    const filePath = path.join(__dirname, '../constants/regionOptions.js');
    console.log('📁 文件路徑:', filePath);
    
    const fileContent = `module.exports = ${JSON.stringify(regions, null, 2)};`;
    console.log('📝 準備寫入文件內容長度:', fileContent.length);
    
    await fs.writeFile(filePath, fileContent, 'utf8');
    console.log('✅ 成功保存地區配置到文件');
    
    res.json({ message: 'Regions updated successfully' });
  } catch (error) {
    console.error('❌ 更新地區配置時發生錯誤:', error);
    console.error('錯誤詳情:', error.message);
    console.error('錯誤堆棧:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update regions',
      details: error.message 
    });
  }
});

// 获取教学模式配置
router.get('/teaching-modes', verifyToken, isAdmin, async (req, res) => {
  try {
    const { TEACHING_MODE_OPTIONS } = require('../constants/teachingModeOptions');
    res.json(TEACHING_MODE_OPTIONS);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teaching modes' });
  }
});

// 更新教学模式配置
router.post('/teaching-modes', verifyToken, isAdmin, async (req, res) => {
  try {
    const { teachingModes } = req.body;
    const filePath = path.join(__dirname, '../constants/teachingModeOptions.js');
    
    const fileContent = `module.exports = { TEACHING_MODE_OPTIONS: ${JSON.stringify(teachingModes, null, 2)} };`;
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    res.json({ message: 'Teaching modes updated successfully' });
  } catch (error) {
    console.error('Error updating teaching modes:', error);
    res.status(500).json({ error: 'Failed to update teaching modes' });
  }
});

module.exports = router; 