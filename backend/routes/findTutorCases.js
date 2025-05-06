const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  console.log('收到 /api/find-tutor-cases POST 請求');
  res.json({ message: '收到學生個案 POST' });
});

module.exports = router; 