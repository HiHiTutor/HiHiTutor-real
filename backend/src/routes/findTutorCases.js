const express = require('express');
const router = express.Router();
const TutorCase = require('../models/TutorCase');

// 獲取所有導師個案（顯示在 find-tutor-cases 頁面）
router.get('/', async (req, res) => {
  try {
    const cases = await TutorCase.find()
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        cases
      }
    });
  } catch (error) {
    console.error('Error getting tutor cases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 創建導師個案（導師發布找學生的個案）
router.post('/', async (req, res) => {
  try {
    const newCase = new TutorCase(req.body);
    await newCase.save();
    res.json({
      success: true,
      data: newCase
    });
  } catch (error) {
    console.error('Error creating tutor case:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 