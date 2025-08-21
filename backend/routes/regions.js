const express = require('express');
const router = express.Router();
const Region = require('../models/Region');
const regionOptions = require('../constants/regionOptions'); // 作為備用

// 獲取所有地區選項
router.get('/', async (req, res) => {
  try {
    // 優先從數據庫獲取
    let regions = await Region.find({ isActive: true }).sort({ sortOrder: 1 });
    
    // 如果數據庫沒有數據，使用備用配置
    if (!regions || regions.length === 0) {
      console.log('⚠️ 數據庫中沒有地區數據，使用備用配置');
      regions = regionOptions;
    }
    
    res.json({
      success: true,
      data: regions,
      source: 'database'
    });
  } catch (error) {
    console.error('❌ 獲取地區選項錯誤:', error);
    // 出錯時使用備用配置
    res.json({
      success: true,
      data: regionOptions,
      source: 'fallback'
    });
  }
});

// 根據地區值獲取地區標籤
router.get('/label/:value', (req, res) => {
  try {
    const { value } = req.params;
    const region = regionOptions.find(r => r.value === value);
    
    if (!region) {
      return res.status(404).json({
        success: false,
        message: '找不到該地區'
      });
    }
    
    res.json({
      success: true,
      data: {
        value: region.value,
        label: region.label
      }
    });
  } catch (error) {
    console.error('❌ 獲取地區標籤錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取地區標籤失敗',
      error: error.message
    });
  }
});

// 根據子地區值獲取子地區標籤
router.get('/subregion/label/:value', (req, res) => {
  try {
    const { value } = req.params;
    let foundSubRegion = null;
    
    for (const region of regionOptions) {
      const subRegion = region.regions.find(sr => sr.value === value);
      if (subRegion) {
        foundSubRegion = {
          parentRegion: {
            value: region.value,
            label: region.label
          },
          subRegion: {
            value: subRegion.value,
            label: subRegion.label
          }
        };
        break;
      }
    }
    
    if (!foundSubRegion) {
      return res.status(404).json({
        success: false,
        message: '找不到該子地區'
      });
    }
    
    res.json({
      success: true,
      data: foundSubRegion
    });
  } catch (error) {
    console.error('❌ 獲取子地區標籤錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取子地區標籤失敗',
      error: error.message
    });
  }
});

// 初始化地區數據庫 (僅用於開發/部署)
router.post('/init', async (req, res) => {
  try {
    const { initRegions } = require('../scripts/initRegions');
    await initRegions();
    
    res.json({
      success: true,
      message: '地區數據庫初始化成功'
    });
  } catch (error) {
    console.error('❌ 初始化地區數據庫失敗:', error);
    res.status(500).json({
      success: false,
      message: '初始化地區數據庫失敗',
      error: error.message
    });
  }
});

module.exports = router; 