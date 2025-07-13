const express = require('express');
const router = express.Router();
const { TEACHING_MODE_OPTIONS } = require('../constants/teachingModeOptions');

// 獲取所有教學模式選項
router.get('/', (req, res) => {
  res.json(TEACHING_MODE_OPTIONS);
});

module.exports = router; 