import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const categories = [
    { id: 1, name: '國小', slug: 'elementary' },
    { id: 2, name: '國中', slug: 'junior-high' },
    { id: 3, name: '高中', slug: 'senior-high' },
    { id: 4, name: '大學', slug: 'university' },
    { id: 5, name: '研究所', slug: 'graduate' }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
} 