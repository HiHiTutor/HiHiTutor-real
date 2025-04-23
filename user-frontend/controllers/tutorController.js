// Mock data for recommended tutors
const recommendedTutors = [
  {
    id: 1,
    name: '陳老師',
    subjects: ['數學', '物理'],
    rating: 4.8,
    avatar: '/avatars/teacher1.png'
  },
  {
    id: 2,
    name: '李老師',
    subjects: ['英文'],
    rating: 4.9,
    avatar: '/avatars/teacher2.png'
  },
  {
    id: 3,
    name: '王老師',
    subjects: ['化學', '生物'],
    rating: 4.7,
    avatar: '/avatars/teacher3.png'
  },
  {
    id: 4,
    name: '張老師',
    subjects: ['中文'],
    rating: 4.9,
    avatar: '/avatars/teacher4.png'
  },
  {
    id: 5,
    name: '林老師',
    subjects: ['經濟', '會計'],
    rating: 4.8,
    avatar: '/avatars/teacher5.png'
  },
  {
    id: 6,
    name: '黃老師',
    subjects: ['歷史', '地理'],
    rating: 4.7,
    avatar: '/avatars/teacher6.png'
  },
  {
    id: 7,
    name: '吳老師',
    subjects: ['音樂', '美術'],
    rating: 4.9,
    avatar: '/avatars/teacher7.png'
  },
  {
    id: 8,
    name: '鄭老師',
    subjects: ['體育', '健康教育'],
    rating: 4.8,
    avatar: '/avatars/teacher8.png'
  }
];

// Controller function to get recommended tutors
const getRecommendedTutors = (req, res) => {
  try {
    res.json(recommendedTutors);
  } catch (error) {
    console.error('Error fetching recommended tutors:', error);
    res.status(500).json({ error: 'Failed to fetch recommended tutors' });
  }
};

module.exports = {
  getRecommendedTutors
}; 