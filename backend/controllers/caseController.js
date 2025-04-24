const cases = require('../data/cases');

// 獲取所有學生個案
const getAllCases = (req, res) => {
  res.json(cases);
};

// 獲取最新的學生個案（以 ID 倒序排序，取前 8 個）
const getLatestCases = (req, res) => {
  try {
    // 複製原始陣列並排序
    const sortedCases = [...cases].sort((a, b) => b.id - a.id);
    
    // 取前 8 個
    const latestCases = sortedCases.slice(0, 8);
    
    console.log("📦 最新個案:", latestCases); // 添加日誌
    res.json(latestCases);
  } catch (err) {
    console.error("❌ 最新個案 error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 根據 ID 獲取單一個案
const getCaseById = (req, res) => {
  const id = parseInt(req.params.id);
  const caseItem = cases.find(item => item.id === id);
  
  if (!caseItem) {
    return res.status(404).json({ error: 'Case not found' });
  }
  
  res.json(caseItem);
};

module.exports = {
  getAllCases,
  getLatestCases,
  getCaseById
}; 