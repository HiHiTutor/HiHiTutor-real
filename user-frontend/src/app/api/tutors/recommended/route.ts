import { NextResponse } from 'next/server';
import { mockTutors, sortTutors } from '../route';

// 模擬資料庫中的導師資料
const recommendedTutors = [
  {
    id: 1,
    name: '王老師',
    subject: '數學',
    experience: 5,
    hourlyRate: 300,
    rating: 4.9,
    tags: ['中學數學', 'DSE', 'IB'],
    avatar: '/avatars/teacher1.png'
  },
  {
    id: 2,
    name: '李老師',
    subject: '英語',
    experience: 8,
    hourlyRate: 350,
    rating: 4.8,
    tags: ['英語會話', 'IELTS', 'TOEFL'],
    avatar: '/avatars/teacher2.png'
  },
  {
    id: 3,
    name: '陳老師',
    subject: '物理',
    experience: 6,
    hourlyRate: 320,
    rating: 4.7,
    tags: ['高中物理', 'AP Physics', 'IB Physics'],
    avatar: '/avatars/teacher3.png'
  },
  {
    id: 4,
    name: '張老師',
    subject: '化學',
    experience: 7,
    hourlyRate: 330,
    rating: 4.9,
    tags: ['高中化學', 'DSE', 'A-Level'],
    avatar: '/avatars/teacher4.png'
  },
  {
    id: 5,
    name: '林老師',
    subject: '生物',
    experience: 4,
    hourlyRate: 310,
    rating: 4.8,
    tags: ['高中生物', 'DSE', 'IB'],
    avatar: '/avatars/teacher5.png'
  },
  {
    id: 6,
    name: '黃老師',
    subject: '中文',
    experience: 9,
    hourlyRate: 340,
    rating: 4.7,
    tags: ['中文寫作', 'DSE', 'IB'],
    avatar: '/avatars/teacher6.png'
  },
  {
    id: 7,
    name: '吳老師',
    subject: '經濟',
    experience: 6,
    hourlyRate: 330,
    rating: 4.9,
    tags: ['經濟學', 'DSE', 'A-Level'],
    avatar: '/avatars/teacher1.png'
  },
  {
    id: 8,
    name: '鄭老師',
    subject: '會計',
    experience: 5,
    hourlyRate: 320,
    rating: 4.8,
    tags: ['會計學', 'DSE', 'A-Level'],
    avatar: '/avatars/teacher2.png'
  }
];

export async function GET() {
  const sorted = sortTutors([...mockTutors]);
  return NextResponse.json(sorted.slice(0, 8)); // 只取前 8 位
} 