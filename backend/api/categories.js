import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const categories = [
    { id: 1, name: '國小', slug: 'elementary', subjectCount: 5 },
    { id: 2, name: '國中', slug: 'junior-high', subjectCount: 8 },
    { id: 3, name: '高中', slug: 'senior-high', subjectCount: 10 },
    { id: 4, name: '大學', slug: 'university', subjectCount: 12 },
    { id: 5, name: '研究所', slug: 'graduate', subjectCount: 3 }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
} 