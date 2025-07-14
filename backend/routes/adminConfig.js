const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const adminAuth = require('../middleware/adminAuth');

// 获取科目配置
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categoryOptions = require('../constants/categoryOptions');
    res.json(categoryOptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// 更新科目配置
router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { categories } = req.body;
    const filePath = path.join(__dirname, '../constants/categoryOptions.js');
    
    const fileContent = `module.exports = ${JSON.stringify(categories, null, 2)};`;
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    res.json({ message: 'Categories updated successfully' });
  } catch (error) {
    console.error('Error updating categories:', error);
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

// 获取地区配置
router.get('/regions', adminAuth, async (req, res) => {
  try {
    const regionOptions = require('../constants/regionOptions');
    res.json(regionOptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load regions' });
  }
});

// 更新地区配置
router.post('/regions', adminAuth, async (req, res) => {
  try {
    const { regions } = req.body;
    const filePath = path.join(__dirname, '../constants/regionOptions.js');
    
    const fileContent = `module.exports = ${JSON.stringify(regions, null, 2)};`;
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    res.json({ message: 'Regions updated successfully' });
  } catch (error) {
    console.error('Error updating regions:', error);
    res.status(500).json({ error: 'Failed to update regions' });
  }
});

// 获取教学模式配置
router.get('/teaching-modes', adminAuth, async (req, res) => {
  try {
    const { TEACHING_MODE_OPTIONS } = require('../constants/teachingModeOptions');
    res.json(TEACHING_MODE_OPTIONS);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teaching modes' });
  }
});

// 更新教学模式配置
router.post('/teaching-modes', adminAuth, async (req, res) => {
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