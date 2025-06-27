const express = require('express');
const router = express.Router();
const StudentCase = require('../models/StudentCase');

// 獲取所有學生個案（顯示在 find-student-cases 頁面）
router.get('/', async (req, res) => {
  try {
    const cases = await StudentCase.find()
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        cases
      }
    });
  } catch (error) {
    console.error('Error getting student cases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 創建學生個案（學生發布找導師的個案）
router.post('/', async (req, res) => {
  try {
    const newCase = new StudentCase(req.body);
    await newCase.save();
    res.json({
      success: true,
      data: newCase
    });
  } catch (error) {
    console.error('Error creating student case:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 