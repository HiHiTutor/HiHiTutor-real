const express = require('express');
const router = express.Router();
const studentCases = require('../data/studentCases.json');

// GET latest cases
router.get('/latest', (req, res) => {
  // 過濾已批准的個案
  const approvedCases = studentCases.filter(case_ => case_.status === 'approved');
  
  // 根據 createdAt 排序（新到舊）
  const sortedCases = approvedCases.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // 最多返回10個最新個案
  const latestCases = sortedCases.slice(0, 10);
  
  res.json(latestCases);
});

module.exports = router; 