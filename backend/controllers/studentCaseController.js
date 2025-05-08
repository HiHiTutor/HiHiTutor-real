const studentCaseRepository = require('../repositories/StudentCaseRepository');
const { loadStudentCases, saveStudentCases } = require('../utils/studentCaseStorage');

// 獲取所有學生案例
const getAllStudentCases = (req, res) => {
  try {
    let allCases = loadStudentCases(); // 直接讀檔案
    // 按 createdAt 或 date 由新到舊排序
    allCases = allCases.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA;
    });
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

const getStudentCaseById = (req, res) => {
  try {
    const case_ = studentCaseRepository.getStudentCaseById(req.params.id);
    if (!case_) {
      return res.status(404).json({
        success: false,
        message: '找不到該學生個案'
      });
    }
    res.json({
      success: true,
      data: case_,
      message: '成功獲取學生個案'
    });
  } catch (error) {
    console.error('[❌] 處理單個學生個案請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取學生個案失敗'
    });
  }
};

module.exports = {
  getAllStudentCases,
  createStudentCase,
  getStudentCaseById
}; 