const express = require('express');
const router = express.Router();
const Region = require('../models/Region');

// 獲取所有地區配置 (公開API)
router.get('/', async (req, res) => {
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

// 根據地區值獲取地區標籤
router.get('/label/:value', async (req, res) => {
  try {
    const { value } = req.params;
    const region = await Region.findOne({ value, isActive: true });
    
    if (region) {
      res.json({ label: region.label });
    } else {
      // 備用：從文件查找
      try {
        const regionOptions = require('../constants/regionOptions');
        const regionOption = regionOptions.find(option => option.value === value);
        if (regionOption) {
          res.json({ label: regionOption.label });
        } else {
          res.status(404).json({ error: 'Region not found' });
        }
      } catch (fileError) {
        res.status(404).json({ error: 'Region not found' });
      }
    }
  } catch (error) {
    console.error('❌ 獲取地區標籤時發生錯誤:', error);
    res.status(500).json({ error: 'Failed to get region label' });
  }
});

// 根據子地區值獲取子地區標籤
router.get('/subregion/label/:value', async (req, res) => {
  try {
    const { value } = req.params;
    const region = await Region.findOne({ 
      'regions.value': value, 
      isActive: true 
    });
    
    if (region) {
      const subRegion = region.regions.find(sub => sub.value === value);
      if (subRegion) {
        res.json({ 
          label: subRegion.label,
          regionLabel: region.label,
          regionValue: region.value
        });
      } else {
        res.status(404).json({ error: 'Sub-region not found' });
      }
    } else {
      // 備用：從文件查找
      try {
        const regionOptions = require('../constants/regionOptions');
        for (const regionOption of regionOptions) {
          const subRegion = regionOption.regions?.find(sub => sub.value === value);
          if (subRegion) {
            res.json({ 
              label: subRegion.label,
              regionLabel: regionOption.label,
              regionValue: regionOption.value
            });
            return;
          }
        }
        res.status(404).json({ error: 'Sub-region not found' });
      } catch (fileError) {
        res.status(404).json({ error: 'Sub-region not found' });
      }
    }
  } catch (error) {
    console.error('❌ 獲取子地區標籤時發生錯誤:', error);
    res.status(500).json({ error: 'Failed to get sub-region label' });
  }
});

module.exports = router;