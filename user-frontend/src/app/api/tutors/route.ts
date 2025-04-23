import { NextResponse } from 'next/server';

const mockTutors = [
  {
    id: 1,
    name: "王老師",
    subject: "數學",
    experience: "5年",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 4.8
  },
  {
    id: 2,
    name: "陳老師",
    subject: "英文",
    experience: "3年",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 4.5
  },
  {
    id: 3,
    name: "李老師",
    subject: "物理",
    experience: "7年",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 4.9
  },
  {
    id: 4,
    name: "張老師",
    subject: "化學",
    experience: "4年",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    rating: 4.7
  },
  {
    id: 5,
    name: "黃老師",
    subject: "生物",
    experience: "6年",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    rating: 4.6
  },
  {
    id: 6,
    name: "林老師",
    subject: "中文",
    experience: "8年",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    rating: 5.0
  }
];

export async function GET() {
  return NextResponse.json(mockTutors);
} 