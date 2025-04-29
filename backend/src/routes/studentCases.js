const express = require('express');
const fs = require('fs');
const path = require('path');

const studentCasesData = fs.readFileSync(path.resolve(__dirname, '../data/studentCases.json'));
const tutorCasesData = fs.readFileSync(path.resolve(__dirname, '../data/tutorCases.json'));

const studentCases = JSON.parse(studentCasesData);
const tutorCases = JSON.parse(tutorCasesData);

const router = express.Router();

// 學生出Post搵導師
router.get('/find-tutor-cases', (req, res) => {
  const { category, subCategory, region, priceMin, priceMax, featured, limit, page } = req.query;
  let filtered = Array.isArray(studentCases) ? studentCases : [];

  // 如果請求精選個案
  if (featured === 'true') {
    filtered = filtered.filter(item => item.featured === true);
  }

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

  // 如果有 date 欄位，按 date 由新到舊排序
  if (filtered.length > 0 && filtered[0].date) {
    filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 處理分頁 - 在過濾和排序後進行
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  // 確保 startIndex 不超過陣列長度
  if (startIndex >= filtered.length) {
    return res.json([]);
  }

  // 在過濾和排序後的陣列上進行分頁
  const paginatedCases = filtered.slice(startIndex, endIndex);

  res.json(paginatedCases);
});

// 導師出Post搵學生
router.get('/find-student-cases', (req, res) => {
  const { featured, limit, page } = req.query;
  let filtered = Array.isArray(tutorCases) ? tutorCases : [];

  // 如果請求精選個案
  if (featured === 'true') {
    filtered = filtered.filter(item => item.featured === true);
  }

  // 如果有 date 欄位，按 date 由新到舊排序
  if (filtered.length > 0 && filtered[0].date) {
    filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 處理分頁
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedCases = filtered.slice(startIndex, endIndex);

  res.json(paginatedCases);
});

// 單一導師個案詳情
router.get('/find-student-cases/:id', (req, res) => {
  const found = Array.isArray(tutorCases) ? tutorCases.find(item => item.id === req.params.id) : null;
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ message: '個案未找到' });
  }
});

// 單一學生個案詳情
router.get('/find-tutor-cases/:id', (req, res) => {
  const found = Array.isArray(studentCases) ? studentCases.find(item => item.id === req.params.id) : null;
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ message: '個案未找到' });
  }
});

// 精選導師個案（List）
router.get('/recommended-tutor-cases', (req, res) => {
  let filtered = Array.isArray(tutorCases) ? tutorCases.filter(item => item.isRecommended === true) : [];
  // 如果有 date 欄位，按 date 由新到舊排序
  if (filtered.length > 0 && filtered[0].date) {
    filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  res.json(filtered);
});

module.exports = router; 