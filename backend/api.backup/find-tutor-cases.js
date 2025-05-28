import cors from './_utils/cors';
const TutorCase = require('../models/TutorCase');

export default async (req, res) => {
  if (cors(req, res)) return;

  try {
    const { featured, limit } = req.query;
    let query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }

    const allCases = await TutorCase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 0);

    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取導師案例列表'
    });
  } catch (error) {
    console.error('Error fetching tutor cases:', error);
    res.status(500).json({ success: false, message: '獲取導師案例時發生錯誤' });
  }
}; 