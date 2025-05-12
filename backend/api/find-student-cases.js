import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const allCases = [
    {
      id: 1,
      subject: '數學',
      region: '台北市',
      mode: '面對面',
      experienceLevel: '不限',
      price: '600',
      createdAt: '2024-03-20',
      featured: true
    },
    {
      id: 2,
      subject: '英文',
      region: '新北市',
      mode: '線上',
      experienceLevel: '有經驗',
      price: '700',
      createdAt: '2024-03-19',
      featured: true
    },
    {
      id: 3,
      subject: '物理',
      region: '台北市',
      mode: '面對面',
      experienceLevel: '不限',
      price: '800',
      createdAt: '2024-03-18',
      featured: false
    },
    {
      id: 4,
      subject: '微積分',
      region: '台北市',
      mode: '線上',
      experienceLevel: '不限',
      price: '900',
      createdAt: '2024-03-17',
      featured: true
    }
  ];

  // 處理查詢參數
  let filteredCases = [...allCases];
  
  // 如果指定 featured，只返回 featured 的案例
  if (req.query.featured === 'true') {
    filteredCases = filteredCases.filter(case_ => case_.featured);
  }

  // 如果指定 limit，限制返回數量
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    filteredCases = filteredCases.slice(0, limit);
  }

  res.status(200).json({
    success: true,
    data: filteredCases
  });
} 