const StudentCase = require('../models/StudentCase');

// 獲取所有學生案例
const getAllStudentCases = async (req, res) => {
  try {
    const allCases = await StudentCase.find().sort({ createdAt: -1 });
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

const createStudentCase = async (req, res) => {
  try {
    const newCase = new StudentCase({ ...req.body, createdAt: new Date() });
    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ success: false, message: '建立學生案例失敗' });
  }
};

const getStudentCaseById = async (req, res) => {
  try {
    const case_ = await StudentCase.findOne({ id: req.params.id });
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