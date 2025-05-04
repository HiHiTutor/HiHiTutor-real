const fs = require('fs');
const path = require('path');
const tutorCaseRepository = require('../repositories/TutorCaseRepository');

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
    const { featured, limit, page = 1 } = req.query;
    let cases = tutorCaseRepository.getAllTutorCases();

    // 過濾特色案例
    if (featured === 'true') {
      cases = cases.filter(c => c.featured === true);
    }

    // 分頁
    const pageSize = limit ? Number(limit) : 10;
    const startIndex = (Number(page) - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCases = cases.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        cases: paginatedCases,
        total: cases.length,
        page: Number(page),
        limit: pageSize,
        totalPages: Math.ceil(cases.length / pageSize)
      },
      message: '成功獲取導師案例列表'
    });
  } catch (error) {
    console.error('[❌] 獲取導師案例失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師案例時發生錯誤'
    });
  }
};

// 獲取推薦導師案例
const getRecommendedTutorCases = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendedCases = tutorCaseRepository.getFeaturedTutorCases(limit);

    res.json({
      success: true,
      data: {
        cases: recommendedCases,
        total: recommendedCases.length
      },
      message: '成功獲取推薦導師案例'
    });
  } catch (error) {
    console.error('[❌] 獲取推薦導師案例失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取推薦導師案例時發生錯誤'
    });
  }
};

module.exports = {
  getAllTutorCases,
  getRecommendedTutorCases
}; 