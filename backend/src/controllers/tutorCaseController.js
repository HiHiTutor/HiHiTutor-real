const { loadTutorCases } = require('../utils/tutorCaseStorage');
const TutorCase = require('../models/TutorCase');

// 獲取所有導師個案
const getAllTutorCases = async (req, res) => {
  try {
    const cases = await TutorCase.find()
      .sort({ createdAt: -1 })
      .populate('student', 'name')
      .populate('tutor', 'name');

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('獲取導師個案列表時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案列表時發生錯誤'
    });
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

// 獲取單個導師案例
const getTutorCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 開始查找個案 ID:', id);

    let caseItem = null;

    // 首先嘗試使用 ObjectId 查找
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('🔍 嘗試使用 ObjectId 查找');
      caseItem = await TutorCase.findById(id);
      console.log('🔍 ObjectId 查找結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      // 如果通過 _id 找不到，或者不是有效的 ObjectId，嘗試通過 id 字段查找
      console.log('🔍 嘗試使用自定義 ID 查找');
      caseItem = await TutorCase.findOne({ id: id });
      console.log('🔍 自定義 ID 查找結果:', caseItem ? '找到' : '未找到');
    }

    if (!caseItem) {
      console.log('❌ 找不到個案 ID:', id);
      return res.status(404).json({
        success: false,
        error: 'Case not found',
        message: '找不到指定的個案'
      });
    }

    console.log('✅ 成功找到個案:', id);
    console.log('📦 個案數據:', JSON.stringify(caseItem, null, 2));
    
    res.json({
      success: true,
      data: caseItem,
      message: '成功獲取個案詳情'
    });
  } catch (err) {
    console.error('❌ Error in /api/tutor-cases/:id:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// 創建導師案例
const createTutorCase = async (req, res) => {
  try {
    const newCase = new TutorCase(req.body);
    await newCase.save();
    res.status(201).json({
      success: true,
      data: newCase,
      message: '導師個案創建成功'
    });
  } catch (error) {
    console.error('創建導師個案時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建導師個案時發生錯誤'
    });
  }
};

module.exports = {
  getAllTutorCases,
  getRecommendedTutorCases,
  getTutorCaseById,
  createTutorCase
}; 