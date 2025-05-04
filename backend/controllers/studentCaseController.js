const studentCaseRepository = require('../repositories/StudentCaseRepository');

// 獲取所有學生案例
const getAllStudentCases = (req, res) => {
  try {
    const { featured, limit, page = 1 } = req.query;
    let cases = studentCaseRepository.getAllStudentCases();

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
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    console.error('[❌] 獲取學生案例失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取學生案例時發生錯誤'
    });
  }
};

// 獲取推薦學生案例
const getRecommendedStudentCases = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendedCases = studentCaseRepository.getFeaturedStudentCases(limit);

    res.json({
      success: true,
      data: {
        cases: recommendedCases,
        total: recommendedCases.length
      },
      message: '成功獲取推薦學生案例'
    });
  } catch (error) {
    console.error('[❌] 獲取推薦學生案例失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取推薦學生案例時發生錯誤'
    });
  }
};

module.exports = {
  getAllStudentCases,
  getRecommendedStudentCases
}; 