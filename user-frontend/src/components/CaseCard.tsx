'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { getRegionName, getSubjectName, getSubRegionName } from '@/utils/translate';
import { CalendarIcon, BookOpenIcon, MapPinIcon, AcademicCapIcon, ComputerDesktopIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/date';

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
  routeType?: 'student' | 'tutor'
  borderColor?: string
}

export default function CaseCard({ caseData, routeType = 'tutor', borderColor }: CaseCardProps) {
  const router = useRouter();

  if (!caseData) return null;

  // 統一使用黃色主題
  const colorScheme = {
    border: 'border-yellow-200',
    hover: 'hover:border-yellow-300',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    button: 'bg-yellow-500 hover:bg-yellow-600'
  };

  return (
    <div 
      className={`rounded-xl border ${borderColor || colorScheme.border} ${colorScheme.hover} p-4 transition-all cursor-pointer ${colorScheme.bg}`}
      onClick={() => router.push(`/${routeType}-cases/${caseData.id}`)}
    >
      {/* 標題 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold line-clamp-2">
          {caseData.title || '未命名個案'}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>{formatDate(caseData.createdAt)}</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <BookOpenIcon className={`h-5 w-5 ${colorScheme.text}`} />
          <span>{caseData.subject?.label || '未指定科目'}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPinIcon className={`h-5 w-5 ${colorScheme.text}`} />
          <span>{caseData.region?.label || '未指定地區'}</span>
        </div>
        <div className="flex items-start gap-2">
          <AcademicCapIcon className={`h-5 w-5 ${colorScheme.text}`} />
          <span>{caseData.experienceLevel?.label || '未指定經驗要求'}</span>
        </div>
        {caseData.modes && (
          <div className="flex items-start gap-2">
            <ComputerDesktopIcon className={`h-5 w-5 ${colorScheme.text}`} />
            <span>{caseData.modes.join(', ')}</span>
          </div>
        )}
        {caseData.lessonDetails && (
          <div className="flex items-start gap-2">
            <CurrencyDollarIcon className={`h-5 w-5 ${colorScheme.text}`} />
            <span>每堂 ${caseData.lessonDetails.pricePerLesson}</span>
          </div>
        )}
      </div>

      {/* 查看詳情按鈕 */}
      <div className="mt-4">
        <button
          className={`w-full ${colorScheme.button} text-white rounded-lg py-2 text-sm transition-colors`}
        >
          查看詳情
        </button>
      </div>
    </div>
  );
} 