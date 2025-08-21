const express = require('express');
const router = express.Router();
const TeachingMode = require('../models/TeachingMode');
const { LEGACY_MODE_MAPPINGS, SUB_MODE_MAPPINGS } = require('../scripts/initTeachingModes');

// 獲取所有教學模式
router.get('/', async (req, res) => {
  try {
    const teachingModes = await TeachingMode.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: teachingModes,
      message: '成功獲取教學模式資料'
    });
  } catch (error) {
    console.error('獲取教學模式失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取教學模式失敗',
      error: error.message
    });
  }
});

// 獲取特定教學模式
router.get('/:value', async (req, res) => {
  try {
    const { value } = req.params;
    const teachingMode = await TeachingMode.findOne({ 
      value: value,
      isActive: true 
    }).select('-__v');
    
    if (!teachingMode) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的教學模式'
      });
    }
    
    res.json({
      success: true,
      data: teachingMode,
      message: '成功獲取教學模式資料'
    });
  } catch (error) {
    console.error('獲取教學模式失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取教學模式失敗',
      error: error.message
    });
  }
});

// 初始化教學模式資料庫
router.post('/init', async (req, res) => {
  try {
    const { initTeachingModes } = require('../scripts/initTeachingModes');
    await initTeachingModes();
    
    res.json({
      success: true,
      message: '教學模式資料庫初始化成功'
    });
  } catch (error) {
    console.error('初始化教學模式失敗:', error);
    res.status(500).json({
      success: false,
      message: '初始化教學模式失敗',
      error: error.message
    });
  }
});

// 轉換舊格式到新格式
router.post('/convert', async (req, res) => {
  try {
    const { oldMode, oldSubMode } = req.body;
    
    if (!oldMode) {
      return res.status(400).json({
        success: false,
        message: '請提供舊的教學模式'
      });
    }
    
    // 轉換主模式
    const newMode = LEGACY_MODE_MAPPINGS[oldMode] || oldMode;
    
    // 轉換子模式
    let newSubMode = null;
    if (oldSubMode) {
      newSubMode = SUB_MODE_MAPPINGS[oldSubMode] || oldSubMode;
    }
    
    res.json({
      success: true,
      data: {
        oldMode,
        oldSubMode,
        newMode,
        newSubMode
      },
      message: '格式轉換成功'
    });
  } catch (error) {
    console.error('格式轉換失敗:', error);
    res.status(500).json({
      success: false,
      message: '格式轉換失敗',
      error: error.message
    });
  }
});

// 獲取教學模式映射表
router.get('/mappings/legacy', (req, res) => {
  res.json({
    success: true,
    data: LEGACY_MODE_MAPPINGS,
    message: '成功獲取舊格式映射表'
  });
});

router.get('/mappings/sub-modes', (req, res) => {
  res.json({
    success: true,
    data: SUB_MODE_MAPPINGS,
    message: '成功獲取子模式映射表'
  });
});

// 驗證教學模式是否有效
router.post('/validate', async (req, res) => {
  try {
    const { mode, subMode } = req.body;
    
    if (!mode) {
      return res.status(400).json({
        success: false,
        message: '請提供教學模式'
      });
    }
    
    // 檢查主模式
    const mainMode = await TeachingMode.findOne({ 
      value: mode,
      isActive: true 
    });
    
    if (!mainMode) {
      return res.json({
        success: false,
        isValid: false,
        message: '無效的教學模式',
        suggestions: Object.values(LEGACY_MODE_MAPPINGS)
      });
    }
    
    // 檢查子模式
    let isValidSubMode = true;
    let subModeData = null;
    
    if (subMode && mainMode.subCategories.length > 0) {
      subModeData = mainMode.subCategories.find(sub => sub.value === subMode);
      isValidSubMode = !!subModeData;
    }
    
    res.json({
      success: true,
      isValid: true,
      data: {
        mainMode: {
          value: mainMode.value,
          label: mainMode.label
        },
        subMode: subModeData ? {
          value: subModeData.value,
          label: subModeData.label
        } : null,
        isValidSubMode
      },
      message: '教學模式驗證成功'
    });
  } catch (error) {
    console.error('驗證教學模式失敗:', error);
    res.status(500).json({
      success: false,
      message: '驗證教學模式失敗',
      error: error.message
    });
  }
});

module.exports = router; 