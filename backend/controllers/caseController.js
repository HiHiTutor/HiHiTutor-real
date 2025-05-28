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
    
    let caseItem = null;
    
    // 檢查是否為有效的 MongoDB ObjectId 格式
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // 如果是有效的 ObjectId，使用 findById
      caseItem = await StudentCase.findById(id);
      console.log("🔍 使用 findById 查詢結果:", caseItem ? "找到" : "未找到");
    }
    
    if (!caseItem) {
      // 如果通過 _id 找不到，或者不是有效的 ObjectId，嘗試通過 id 字段查找
      caseItem = await StudentCase.findOne({ id: id });
      console.log("🔍 使用 findOne({id}) 查詢結果:", caseItem ? "找到" : "未找到");
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