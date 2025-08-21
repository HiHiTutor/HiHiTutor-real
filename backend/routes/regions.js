const express = require('express');
const router = express.Router();
const regionOptions = require('../constants/regionOptions');

// 獲取所有地區選項
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: regionOptions
    });
  } catch (error) {
    console.error('❌ 獲取地區選項錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取地區選項失敗',
      error: error.message
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

module.exports = router; 