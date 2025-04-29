const { loadTutorCases } = require('../utils/tutorCaseStorage');

// 獲取所有導師個案
const getAllTutorCases = (req, res) => {
  try {
    const tutorCases = loadTutorCases();
    res.json(tutorCases);
  } catch (error) {
    console.error('獲取導師個案錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
};

// 獲取推薦導師個案
const getRecommendedTutorCases = (req, res) => {
  try {
    const tutorCases = loadTutorCases();
    const recommended = tutorCases
      .filter(tutorCase => tutorCase.status === 'approved') // 選出已審核
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 按時間新排
      .slice(0, 8); // 只取8個

    res.json(recommended);
  } catch (error) {
    console.error('獲取推薦導師個案錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
};

module.exports = {
  getAllTutorCases,
  getRecommendedTutorCases
}; 