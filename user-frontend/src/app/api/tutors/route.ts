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
export const sortTutors = (tutors: any[]) => {
  return tutors.sort((a, b) => {
    // 1. Vip 且置頂 且高評分
    const aIsVipTopHighRating = a.isVip && a.isTop && a.rating >= 4.5;
    const bIsVipTopHighRating = b.isVip && b.isTop && b.rating >= 4.5;
    if (aIsVipTopHighRating !== bIsVipTopHighRating) {
      return aIsVipTopHighRating ? -1 : 1;
    }

    // 2. Vip 且置頂
    const aIsVipTop = a.isVip && a.isTop;
    const bIsVipTop = b.isVip && b.isTop;
    if (aIsVipTop !== bIsVipTop) {
      return aIsVipTop ? -1 : 1;
    }

    // 3. 置頂 且高評分
    const aIsTopHighRating = a.isTop && a.rating >= 4.5;
    const bIsTopHighRating = b.isTop && b.rating >= 4.5;
    if (aIsTopHighRating !== bIsTopHighRating) {
      return aIsTopHighRating ? -1 : 1;
    }

    // 4. 置頂
    if (a.isTop !== b.isTop) {
      return a.isTop ? -1 : 1;
    }

    // 5. 高評分
    const aIsHighRating = a.rating >= 4.5;
    const bIsHighRating = b.rating >= 4.5;
    if (aIsHighRating !== bIsHighRating) {
      return aIsHighRating ? -1 : 1;
    }

    // 6. 評分排序
    return b.rating - a.rating;
  });
};

export async function GET() {
  const sortedTutors = sortTutors([...mockTutors]);
  return NextResponse.json(sortedTutors);
} 