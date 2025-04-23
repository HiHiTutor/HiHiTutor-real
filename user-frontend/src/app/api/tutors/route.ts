import { NextResponse } from 'next/server';

export const mockTutors = [
  {
    id: 1,
    name: "王老師",
    subject: "數學",
    experience: "5年",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 4.8,
    isVip: true,
    isTop: true
  },
  {
    id: 2,
    name: "陳老師",
    subject: "英文",
    experience: "3年",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 4.5,
    isVip: true,
    isTop: false
  },
  {
    id: 3,
    name: "李老師",
    subject: "物理",
    experience: "7年",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 4.9,
    isVip: false,
    isTop: true
  },
  {
    id: 4,
    name: "張老師",
    subject: "化學",
    experience: "4年",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    rating: 4.7,
    isVip: false,
    isTop: false
  },
  {
    id: 5,
    name: "黃老師",
    subject: "生物",
    experience: "6年",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    rating: 4.6,
    isVip: true,
    isTop: true
  },
  {
    id: 6,
    name: "林老師",
    subject: "中文",
    experience: "8年",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    rating: 5.0,
    isVip: false,
    isTop: true
  },
  {
    id: 7,
    name: "吳老師",
    subject: "經濟",
    experience: "4年",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    rating: 4.7,
    isVip: true,
    isTop: false
  },
  {
    id: 8,
    name: "鄭老師",
    subject: "會計",
    experience: "5年",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    rating: 4.8,
    isVip: false,
    isTop: true
  },
  {
    id: 9,
    name: "周老師",
    subject: "歷史",
    experience: "6年",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    rating: 4.9,
    isVip: true,
    isTop: true
  },
  {
    id: 10,
    name: "楊老師",
    subject: "地理",
    experience: "3年",
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    rating: 4.6,
    isVip: false,
    isTop: false
  }
];

// 排序函數
export const sortTutors = (list: any[]) => {
  return list.sort((a, b) => {
    // 排序邏輯: vip + top + rating
    if (a.isVip && a.isTop && b.isVip && b.isTop) return b.rating - a.rating;
    if (a.isVip && a.isTop) return -1;
    if (b.isVip && b.isTop) return 1;
    if (a.isVip) return -1;
    if (b.isVip) return 1;
    if (a.isTop && b.isTop) return b.rating - a.rating;
    if (a.isTop) return -1;
    if (b.isTop) return 1;
    return b.rating - a.rating;
  });
};

export async function GET() {
  const sortedTutors = sortTutors([...mockTutors]);
  return NextResponse.json(sortedTutors);
} 