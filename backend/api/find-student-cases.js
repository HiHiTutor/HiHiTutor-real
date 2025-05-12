import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const allCases = [
    {
      id: 1,
      title: '國小數學家教',
      description: '尋找有耐心的數學家教，協助基礎數學學習。',
      subject: '數學',
      grade: '國小',
      location: '台北市',
      hourlyRate: '600',
      featured: true,
      createdAt: '2024-03-20'
    },
    {
      id: 2,
      title: '國中英文家教',
      description: '需要英文家教協助準備會考。',
      subject: '英文',
      grade: '國中',
      location: '新北市',
      hourlyRate: '700',
      featured: true,
      createdAt: '2024-03-19'
    },
    {
      id: 3,
      title: '高中物理家教',
      description: '尋找物理家教，協助準備學測。',
      subject: '物理',
      grade: '高中',
      location: '台北市',
      hourlyRate: '800',
      featured: false,
      createdAt: '2024-03-18'
    },
    {
      id: 4,
      title: '大學微積分家教',
      description: '需要微積分家教，協助理解課程內容。',
      subject: '微積分',
      grade: '大學',
      location: '台北市',
      hourlyRate: '900',
      featured: true,
      createdAt: '2024-03-17'
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