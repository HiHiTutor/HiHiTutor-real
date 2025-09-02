const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Category = require('../models/Category');
const Region = require('../models/Region');

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
    // 嘗試從數據庫獲取配置
    const regions = await Region.find({ isActive: true }).sort({ sortOrder: 1 });
    
    if (regions.length > 0) {
      // 如果數據庫有數據，轉換為原來的格式
      const regionOptions = regions.map(region => ({
        value: region.value,
        label: region.label,
        regions: region.regions || []
      }));
      
      console.log('✅ 從數據庫載入地區配置:', regionOptions.length, '個地區');
      res.json(regionOptions);
    } else {
      // 如果數據庫沒有數據，從文件讀取（作為備用）
      try {
        const regionOptions = require('../constants/regionOptions');
        console.log('📁 從文件載入地區配置:', regionOptions.length, '個地區');
        res.json(regionOptions);
      } catch (fileError) {
        console.log('無法從文件讀取地區配置，返回空配置');
        res.json([]);
      }
    }
  } catch (error) {
    console.error('❌ 載入地區配置時發生錯誤:', error);
    res.status(500).json({ error: 'Failed to load regions' });
  }
});

// 更新地区配置
router.post('/regions', verifyToken, isAdmin, async (req, res) => {
  try {
    const { regions } = req.body;
    console.log('📥 接收到地區配置更新:', regions?.length, '個地區');
    
    // 清空現有配置
    await Region.deleteMany({});
    console.log('🗑️ 清空現有地區配置');
    
    // 將新的配置保存到數據庫
    const regionDocuments = regions.map((region, index) => ({
      value: region.value,
      label: region.label,
      regions: region.regions || [],
      sortOrder: index,
      isActive: true
    }));
    
    const savedRegions = await Region.insertMany(regionDocuments);
    console.log('✅ 成功保存地區配置到數據庫:', savedRegions.length, '個地區');
    
    res.json({ 
      message: 'Regions updated successfully',
      savedCount: savedRegions.length
    });
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