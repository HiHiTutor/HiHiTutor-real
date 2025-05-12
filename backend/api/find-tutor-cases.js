import cors from './_utils/cors';
const TutorCase = require('../models/TutorCase');

export default async (req, res) => {
  if (cors(req, res)) return;

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