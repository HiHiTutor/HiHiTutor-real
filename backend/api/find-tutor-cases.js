import cors from './_utils/cors';

export default function handler(req, res) {
  if (cors(req, res)) return;

  // 假資料
  const tutorCases = [
    {
      id: 1,
      title: '尋找國中數學家教',
      description: '需要一位有經驗的數學家教，每週兩次，每次兩小時。',
      subject: '數學',
      grade: '國中',
      location: '台北市',
      budget: '800/小時',
      createdAt: '2024-03-20'
    },
    {
      id: 2,
      title: '高中英文家教',
      description: '希望找到有教學經驗的英文老師，協助準備學測。',
      subject: '英文',
      grade: '高中',
      location: '新北市',
      budget: '1000/小時',
      createdAt: '2024-03-19'
    }
  ];

  res.status(200).json({
    success: true,
    data: tutorCases
  });
} 