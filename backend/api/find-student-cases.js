import cors from './_utils/cors';
const StudentCase = require('../models/StudentCase');

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const { featured, limit } = req.query;
    let query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }

    const allCases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 0);

    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    console.error('Error fetching student cases:', error);
    res.status(500).json({ success: false, message: '獲取學生案例時發生錯誤' });
  }
} 