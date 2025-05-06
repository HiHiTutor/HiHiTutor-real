const fs = require('fs');
const path = require('path');
const tutorCaseRepository = require('../repositories/TutorCaseRepository');
const { loadTutorCases, saveTutorCases } = require('../utils/tutorCaseStorage');

// 讀取導師案例數據
let tutorCases = [];
try {
  const data = fs.readFileSync(path.join(__dirname, '../data/tutorCases.json'), 'utf8');
  const jsonData = JSON.parse(data);
  tutorCases = Array.isArray(jsonData.cases) ? jsonData.cases : [];
} catch (error) {
  console.error('Error reading tutor cases:', error);
  tutorCases = [];
}

// 獲取所有導師案例
const getAllTutorCases = (req, res) => {
  try {
    const allCases = loadTutorCases(); // 直接讀檔案
    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取導師案例列表'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '獲取導師案例時發生錯誤' });
  }
};

const createTutorCase = (req, res) => {
  try {
    const allCases = loadTutorCases();
    const newCase = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    allCases.push(newCase);
    saveTutorCases(allCases);
    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    console.error('❌ Error creating tutor case:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllTutorCases,
  createTutorCase
}; 