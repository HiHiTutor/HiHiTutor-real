const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const Category = require('../models/Category');

// 获取科目配置
router.get('/categories', async (req, res) => {
  try {
    console.log('📥 收到科目配置請求');
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
      
      console.log('✅ 從數據庫返回科目配置');
      res.json(categoriesObject);
    } else {
      // 如果數據庫沒有數據，從文件讀取（作為備用）
      try {
        const categoryOptions = require('../constants/categoryOptions');
        console.log('✅ 從文件返回科目配置');
        res.json(categoryOptions);
      } catch (fileError) {
        console.log('⚠️ 無法從文件讀取科目配置，返回空配置');
        res.json({});
      }
    }
  } catch (error) {
    console.error('❌ 載入科目配置錯誤:', error);
    res.status(500).json({ error: 'Failed to load categories', details: error.message });
  }
});

// 更新科目配置
router.post('/categories', async (req, res) => {
  try {
    console.log('📥 收到科目配置更新請求');
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
    console.error('❌ 更新科目配置錯誤:', error);
    res.status(500).json({ error: 'Failed to update categories', details: error.message });
  }
});

// 获取地区配置
router.get('/regions', async (req, res) => {
  try {
    console.log('📥 收到地區配置請求');
    const regionOptions = require('../constants/regionOptions');
    console.log('✅ 成功載入地區配置，地區數量:', regionOptions.length);
    res.json(regionOptions);
  } catch (error) {
    console.error('❌ 載入地區配置錯誤:', error);
    res.status(500).json({ error: 'Failed to load regions', details: error.message });
  }
});

// 更新地区配置
router.post('/regions', async (req, res) => {
  try {
    console.log('📥 收到地區配置更新請求');
    const { regions } = req.body;
    console.log('📥 接收到地區配置更新，地區數量:', regions.length);
    
    const filePath = path.join(__dirname, '../constants/regionOptions.js');
    console.log('📁 檔案路徑:', filePath);
    
    const fileContent = `module.exports = ${JSON.stringify(regions, null, 2)};`;
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log('✅ 成功更新地區配置文件');
    res.json({ message: 'Regions updated successfully' });
  } catch (error) {
    console.error('❌ 更新地區配置錯誤:', error);
    res.status(500).json({ error: 'Failed to update regions', details: error.message });
  }
});

// 获取教学模式配置
router.get('/teaching-modes', async (req, res) => {
  try {
    console.log('📥 收到教學模式配置請求');
    const { TEACHING_MODE_OPTIONS } = require('../constants/teachingModeOptions');
    console.log('✅ 成功載入教學模式配置');
    res.json(TEACHING_MODE_OPTIONS);
  } catch (error) {
    console.error('❌ 載入教學模式配置錯誤:', error);
    res.status(500).json({ error: 'Failed to load teaching modes', details: error.message });
  }
});

// 更新教学模式配置
router.post('/teaching-modes', async (req, res) => {
  try {
    console.log('📥 收到教學模式配置更新請求');
    const { teachingModes } = req.body;
    const filePath = path.join(__dirname, '../constants/teachingModeOptions.js');
    
    const fileContent = `module.exports = { TEACHING_MODE_OPTIONS: ${JSON.stringify(teachingModes, null, 2)} };`;
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log('✅ 成功更新教學模式配置文件');
    res.json({ message: 'Teaching modes updated successfully' });
  } catch (error) {
    console.error('❌ 更新教學模式配置錯誤:', error);
    res.status(500).json({ error: 'Failed to update teaching modes', details: error.message });
  }
});

module.exports = router; 