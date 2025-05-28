const StudentCase = require('../models/StudentCase');

// 獲取所有學生個案
const getAllCases = async (req, res) => {
  try {
    const cases = await StudentCase.find({ featured: true }).sort({ createdAt: -1 });
    console.log("📦 已返回所有個案數量:", cases.length);
    res.json(cases);
  } catch (err) {
    console.error("❌ 獲取所有個案失敗:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 獲取最新的學生個案（以創建時間倒序排序，取前 8 個）
const getLatestCases = async (req, res) => {
  try {
    const latestCases = await StudentCase.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(8);
    
    console.log("📦 已返回最新個案數量:", latestCases.length);
    res.json(latestCases);
  } catch (err) {
    console.error("❌ 獲取最新個案失敗:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 根據 ID 獲取單一個案
const getCaseById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("🔍 查找個案 ID:", id);
    
    // 嘗試通過 _id 或 id 字段查找
    let caseItem = await StudentCase.findById(id);
    
    if (!caseItem) {
      // 如果通過 _id 找不到，嘗試通過 id 字段查找
      caseItem = await StudentCase.findOne({ id: id });
    }
    
    if (!caseItem) {
      console.log("❌ 找不到個案 ID:", id);
      return res.status(404).json({ 
        success: false,
        error: 'Case not found',
        message: '找不到指定的個案'
      });
    }
    
    console.log("📦 已返回個案 ID:", id);
    res.json({
      success: true,
      data: caseItem
    });
  } catch (err) {
    console.error("❌ 獲取個案失敗:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
};

module.exports = {
  getAllCases,
  getLatestCases,
  getCaseById
}; 