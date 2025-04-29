const express = require('express');
const router = express.Router();
const { loadTutorCases } = require('../utils/tutorCaseStorage');
const fs = require('fs').promises;
const path = require('path');

// 1. 首先定義固定路徑路由
// GET all tutor cases
router.get('/', (req, res) => {
  try {
    const tutorCases = loadTutorCases();
    res.json(tutorCases);
  } catch (error) {
    console.error('取得導師個案失敗:', error);
    res.status(500).json({ message: '取得導師個案失敗' });
  }
});

// POST new tutor case
router.post('/', async (req, res) => {
  try {
    // 檢查用戶角色
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ 
        success: false,
        message: '只有升級用戶(導師)可以發佈導師招生個案！' 
      });
    }

    const tutorCases = loadTutorCases();
    const newCase = req.body;
    
    // 生成新的 ID (T001, T002, ...)
    const lastCase = tutorCases[tutorCases.length - 1];
    const lastId = lastCase ? parseInt(lastCase.id.substring(1)) : 0;
    const newId = `T${String(lastId + 1).padStart(3, '0')}`;
    
    // 添加必要的欄位
    const now = new Date().toISOString();
    const completeCase = {
      id: newId,
      ...newCase,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    
    // 添加到陣列
    tutorCases.push(completeCase);
    
    // 寫入檔案
    const filePath = path.join(__dirname, '../data/tutorCases.json');
    await fs.writeFile(filePath, JSON.stringify(tutorCases, null, 2));
    
    res.status(201).json({
      success: true,
      message: '導師個案已成功提交',
      data: completeCase
    });
  } catch (error) {
    console.error('提交導師個案失敗:', error);
    res.status(500).json({
      success: false,
      message: '提交導師個案失敗'
    });
  }
});

// 2. 然後定義具體路徑路由
// GET recommended tutor cases
router.get('/recommended', async (req, res) => {
  try {
    const tutorCases = await loadTutorCases();
    const recommendedCases = tutorCases
      .filter(c => c.status === 'approved') // 假設 status 有 approved
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 新post排前
      .slice(0, 8); // 只取8個

    res.json(recommendedCases);
  } catch (error) {
    console.error('獲取推薦導師個案錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

// 3. 最後定義參數路由
// GET single tutor case by ID
router.get('/:id', (req, res) => {
  try {
    const tutorCases = loadTutorCases();
    const id = req.params.id;
    const tutorCase = tutorCases.find(c => c.id === id);
    
    if (tutorCase) {
      res.json(tutorCase);
    } else {
      res.status(404).json({ message: '找不到此導師個案' });
    }
  } catch (error) {
    console.error('取得導師個案失敗:', error);
    res.status(500).json({ message: '取得導師個案失敗' });
  }
});

// 篩選導師個案
router.get('/find-tutor-cases', async (req, res) => {
  try {
    const { category, subCategory, region, priceMin, priceMax } = req.query;
    const tutorCases = await loadTutorCases();
    let filtered = Array.isArray(tutorCases) ? tutorCases : [];

    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    if (subCategory) {
      const subArr = Array.isArray(subCategory) ? subCategory : subCategory.split(',');
      filtered = filtered.filter(item => subArr.some(sub => item.subCategory.includes(sub)));
    }
    if (region) {
      const regionArr = Array.isArray(region) ? region : region.split(',');
      filtered = filtered.filter(item => regionArr.some(r => item.region.includes(r)));
    }
    if (priceMin || priceMax) {
      filtered = filtered.filter(item => {
        if (!item.priceRange) return false;
        const [min, max] = item.priceRange.split('-').map(Number);
        const minVal = priceMin ? Number(priceMin) : 0;
        const maxVal = priceMax ? Number(priceMax) : 10000;
        return max >= minVal && min <= maxVal;
      });
    }
    res.json(filtered);
  } catch (error) {
    console.error('篩選導師個案失敗:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

module.exports = router; 