const fs = require('fs');
const path = require('path');

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
    if (!Array.isArray(tutorCases)) {
      console.error('tutorCases is not an array:', tutorCases);
      return res.status(500).json({ error: 'Internal server error: Invalid data format' });
    }

    const { featured, limit, page = 1 } = req.query;
    let result = [...tutorCases];

    // 過濾特色案例
    if (featured === 'true') {
      result = result.filter(c => c.featured === true);
    }

    // 分頁
    const pageSize = limit ? Number(limit) : 10;
    const startIndex = (Number(page) - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResult = result.slice(startIndex, endIndex);

    res.json({
      cases: paginatedResult,
      total: result.length,
      page: Number(page),
      limit: pageSize,
      totalPages: Math.ceil(result.length / pageSize)
    });
  } catch (error) {
    console.error('Error in getAllTutorCases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 獲取推薦導師案例
const getRecommendedTutorCases = (req, res) => {
  try {
    if (!Array.isArray(tutorCases)) {
      console.error('tutorCases is not an array:', tutorCases);
      return res.status(500).json({ error: 'Internal server error: Invalid data format' });
    }

    const limit = parseInt(req.query.limit) || 8;
    const recommendedCases = tutorCases
      .filter(case_ => case_.featured)
      .slice(0, limit);

    res.json({
      cases: recommendedCases,
      total: recommendedCases.length
    });
  } catch (error) {
    console.error('Error in getRecommendedTutorCases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllTutorCases,
  getRecommendedTutorCases
}; 