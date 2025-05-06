const express = require('express');
const router = express.Router();

// 測試用：接收 POST 請求
router.post('/', (req, res) => {
  console.log('✅ 收到導師個案 POST 請求');
  res.json({ message: '成功收到導師個案 POST 請求', data: req.body });
});

module.exports = router; 