import { NextResponse } from 'next/server';

const mockCategories = [
  {
    id: 1,
    name: "幼兒教育",
    description: "3-6歲幼兒教育、幼稚園課程輔導"
  },
  {
    id: 2,
    name: "中小學教育",
    description: "小學、國中、高中各科目教學輔導"
  },
  {
    id: 3,
    name: "興趣班",
    description: "音樂、美術、舞蹈、運動等才藝課程"
  },
  {
    id: 4,
    name: "大專補習課程",
    description: "大學、研究所課程輔導與考試準備"
  },
  {
    id: 5,
    name: "成人教育",
    description: "語言、專業技能、證照考試等課程"
  }
];

export async function GET() {
  return NextResponse.json(mockCategories);
} 