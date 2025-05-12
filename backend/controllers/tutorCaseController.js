const TutorCase = require('../models/TutorCase');

// 獲取所有導師案例
const getAllTutorCases = async (req, res) => {
  try {
    const allCases = await TutorCase.find().sort({ createdAt: -1 });
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

const createTutorCase = async (req, res) => {
  try {
    const newCase = new TutorCase({ ...req.body, createdAt: new Date() });
    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ success: false, message: '建立導師案例失敗' });
  }
};

const getTutorCaseById = async (req, res) => {
  try {
    const case_ = await TutorCase.findOne({ id: req.params.id });
    if (!case_) {
      return res.status(404).json({
        success: false,
        message: '找不到該導師個案'
      });
    }
    res.json({
      success: true,
      data: case_,
      message: '成功獲取導師個案'
    });
  } catch (error) {
    console.error('[❌] 處理單個導師個案請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案失敗'
    });
  }
};

module.exports = {
  getAllTutorCases,
  createTutorCase,
  getTutorCaseById
}; 