'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { getRegionName, getSubjectNames, getSubRegionName } from '@/utils/translate';
import { SUBJECT_MAP } from '@/utils/translate';

const MODES: Record<string, string> = {
  'in-person': '面授',
  'online': '網課'
};

const SUB_CATEGORY_MAP: Record<string, string> = {
  'primary': '小學教育',
  'secondary': '中學教育',
  'undergraduate': '大專課程',
  '': ''
};

const SUB_REGION_MAP: Record<string, string> = {
  "diamond-hill": "鑽石山",
  "tsz-wan-shan": "慈雲山",
  "to-kwa-wan": "土瓜灣",
  "shek-tong-tsui": "石塘咀",
  "sham-shui-po": "深水埗",
  "mui-wo": "梅窩",
  "kwai-chung": "葵涌",
  "admiralty": "金鐘",
  "kowloon-city": "九龍城",
  "tai-hang": "大坑",
  "ping-chau": "平洲",
  "lamma-island": "南丫島",
  "tuen-mun": "屯門",
  "wong-tai-sin": "黃大仙",
  "ho-man-tin": "何文田",
  "chai-wan": "柴灣",
  "cheung-chau": "長洲",
  "southern": "南區",
  "kam-sheung-road": "錦上路",
  "hang-hau": "坑口",
  "yuen-long": "元朗",
  "tai-po": "大埔",
  "sha-tin": "沙田",
  "sai-kung": "西貢",
  "fo-tan": "火炭",
  "lohas-park": "日出康城",
  "fan-ling": "粉嶺",
  "sheung-shui": "上水",
  "tai-o": "大澳",
  "discovery-bay": "愉景灣",
  "po-lam": "寶琳",
  "long-ping": "朗屏",
  "tin-shui-wai": "天水圍",
  "kwai-fong": "葵芳",
  "ap-lei-chau": "鴨脷洲",
  "causeway-bay": "銅鑼灣",
  "wan-chai": "灣仔",
  "quarry-bay": "鰂魚涌",
  "central-western": "中西區",
  "wong-chuk-hang": "黃竹坑",
  "sunny-bay": "欣澳",
  "tung-chung": "東涌",
  "jordan": "佐敦",
  "mong-kok": "旺角",
  "kwun-tong": "觀塘",
  "lam-tin": "藍田",
  "heng-fa-chuen": "杏花邨",
  "shau-kei-wan": "筲箕灣",
  "tsing-yi": "青衣",
  "ma-on-shan": "馬鞍山"
};

interface CaseData {
  id: string
  title?: string
  subject?: {
    label: string
  }
  region?: {
    label: string
  }
  mode?: {
    label: string
  }
  experienceLevel?: {
    label: string
  }
  budget?: string
  lessonDetails?: {
    duration: number
    pricePerLesson: number
    lessonsPerWeek: number
  }
  modes?: string[]
  createdAt: string
}

interface CaseCardProps {
  caseData?: CaseData
  borderColor?: string
  routeType?: 'student' | 'tutor'
}

export default function CaseCard({ caseData, borderColor = 'border-gray-200', routeType = 'student' }: CaseCardProps) {
  const router = useRouter()

  if (!caseData) return null // 防止 undefined 時 crash

  console.log('CaseCard received:', caseData);

  const handleClick = () => {
    const basePath = routeType === 'student' ? '/find-student-cases' : '/find-tutor-cases';
    router.push(`${basePath}/${caseData.id}`);
  }

  const subjectLabel = caseData.subject?.label
    ? SUBJECT_MAP[caseData.subject.label] || caseData.subject.label
    : '未命名個案';

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-gray-100 ${borderColor}`}
    >
      <h3 className="text-lg font-semibold text-blue-700 mb-2">
        {caseData.title || '未命名個案'}
      </h3>
      <p className="text-gray-700">科目：{subjectLabel}</p>
      <p className="text-gray-700">地點：{caseData.region?.label || '地點待定'}</p>
      <p className="text-gray-700">教學模式：{
        Array.isArray(caseData.modes) 
          ? caseData.modes.map(mode => MODES[mode] || mode).join('、')
          : caseData.mode?.label || '教學模式待定'
      }</p>
      <p className="text-gray-700">經驗要求：{caseData.experienceLevel?.label || '經驗要求待定'}</p>
      <p className="text-gray-700">收費：{
        caseData.lessonDetails 
          ? `每堂${caseData.lessonDetails.duration}分鐘，每堂HKD ${caseData.lessonDetails.pricePerLesson}，每週${caseData.lessonDetails.lessonsPerWeek}堂`
          : (caseData.budget || '待議')
      }</p>
      <p className="text-sm text-gray-500 mt-2">
        發佈於 {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' }) : '未知日期'}
      </p>
    </div>
  )
} 