import cors from './_utils/cors';
const StudentCase = require('../models/StudentCase');

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const allCases = await StudentCase.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '獲取學生案例時發生錯誤' });
  }
} 