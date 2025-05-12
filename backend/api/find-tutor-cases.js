import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const tutorCases = [
    {
      id: 1,
      subject: '數學',
      region: '台北市',
      mode: '面對面',
      experienceLevel: '3年以上',
      price: '800',
      createdAt: '2024-03-20'
    },
    {
      id: 2,
      subject: '英文',
      region: '新北市',
      mode: '線上',
      experienceLevel: '2年以上',
      price: '1000',
      createdAt: '2024-03-19'
    }
  ];

  res.status(200).json({
    success: true,
    data: tutorCases
  });
} 