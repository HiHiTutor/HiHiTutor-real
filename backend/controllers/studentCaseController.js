const studentCaseRepository = require('../repositories/StudentCaseRepository');
const { loadStudentCases, saveStudentCases } = require('../utils/studentCaseStorage');

// 獲取所有學生案例
const getAllStudentCases = (req, res) => {
  try {
    const allCases = loadStudentCases(); // 直接讀檔案
    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '獲取學生案例時發生錯誤' });
  }
};

const createStudentCase = (req, res) => {
  const newCase = { ...req.body, createdAt: new Date().toISOString() };
  const allCases = loadStudentCases();
  allCases.push(newCase);
  saveStudentCases(allCases);
  res.status(201).json(newCase);
};

module.exports = {
  getAllStudentCases,
  createStudentCase
}; 