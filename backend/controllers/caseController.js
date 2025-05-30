const StudentCase = require('../models/StudentCase');
const TutorCase = require('../models/TutorCase');
const connectDB = require('../config/db');

// 獲取所有個案
const getAllCases = async (req, res) => {
  try {
    // 確保數據庫連接
    await connectDB();
    
    // 獲取查詢參數
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const type = req.query.type; // 'student' or 'tutor'
    
    // 構建查詢條件
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let cases = [];
    let total = 0;

    if (!type || type === 'student') {
      // 獲取學生案例
      const studentCases = await StudentCase.find(query)
        .sort({ createdAt: -1 });
      cases = cases.concat(studentCases.map(c => ({...c.toObject(), type: 'student'})));
      total += await StudentCase.countDocuments(query);
    }

    if (!type || type === 'tutor') {
      // 獲取導師案例
      const tutorCases = await TutorCase.find(query)
        .sort({ createdAt: -1 });
      cases = cases.concat(tutorCases.map(c => ({...c.toObject(), type: 'tutor'})));
      total += await TutorCase.countDocuments(query);
    }

    // 手動處理分頁
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCases = cases.slice(startIndex, endIndex);
    
    console.log("📦 查詢條件:", { ...query, type });
    console.log("📦 已返回個案數量:", paginatedCases.length);
    console.log("📦 總個案數量:", total);
    console.log("📦 完整響應:", {
      success: true,
      data: {
        cases: paginatedCases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        cases: paginatedCases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("❌ 獲取所有個案失敗:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

// 獲取最新的學生個案（以創建時間倒序排序，取前 8 個）
const getLatestCases = async (req, res) => {
  try {
    // 確保數據庫連接
    await connectDB();
    
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
    // 確保數據庫連接
    await connectDB();
    
    const id = req.params.id;
    console.log("🔍 查找個案 ID:", id);
    
    let caseItem = null;
    let type = null;
    
    // 檢查是否為有效的 MongoDB ObjectId 格式
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // 先嘗試在學生案例中查找
      caseItem = await StudentCase.findById(id);
      if (caseItem) {
        type = 'student';
      } else {
        // 如果在學生案例中找不到，嘗試在導師案例中查找
        caseItem = await TutorCase.findById(id);
        if (caseItem) {
          type = 'tutor';
        }
      }
    }
    
    if (!caseItem) {
      // 如果通過 _id 找不到，嘗試通過 id 字段查找
      caseItem = await StudentCase.findOne({ id: id });
      if (caseItem) {
        type = 'student';
      } else {
        caseItem = await TutorCase.findOne({ id: id });
        if (caseItem) {
          type = 'tutor';
        }
      }
    }
    
    if (!caseItem) {
      console.log("❌ 找不到個案 ID:", id);
      return res.status(404).json({ 
        success: false,
        error: 'Case not found',
        message: '找不到指定的個案'
      });
    }
    
    console.log("📦 已返回個案 ID:", id, "類型:", type);
    res.json({
      success: true,
      data: { ...caseItem.toObject(), type }
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