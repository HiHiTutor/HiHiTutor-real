'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { getRegionName, getSubjectNames, getSubRegionName } from '@/utils/translate';

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

const SUBJECT_MAP: Record<string, string> = {
  "early-childhood-chinese": "幼兒中文",
  "early-childhood-english": "幼兒英文",
  "early-childhood-math": "幼兒數學",
  "early-childhood-phonics": "幼兒拼音",
  "early-childhood-logic": "幼兒邏輯",
  "early-childhood-interview": "幼兒面試",
  "early-childhood-homework": "幼兒功課輔導",
  "primary-chinese": "小學中文",
  "primary-english": "小學英文",
  "primary-math": "小學數學",
  "primary-general": "常識／常識科",
  "primary-mandarin": "普通話",
  "primary-stem": "小學STEM",
  "primary-all": "小學全科",
  "secondary-chinese": "中學中文",
  "secondary-english": "中學英文",
  "secondary-math": "中學數學",
  "secondary-ls": "通識教育",
  "secondary-physics": "物理",
  "secondary-chemistry": "化學",
  "secondary-biology": "生物",
  "secondary-economics": "經濟",
  "secondary-geography": "地理",
  "secondary-history": "歷史",
  "secondary-chinese-history": "中國歷史",
  "secondary-bafs": "企會財",
  "secondary-ict": "資訊與通訊科技",
  "secondary-integrated-science": "綜合科學",
  "secondary-dse": "DSE總溫習",
  "secondary-all": "中學全科",
  "secondary-humanities": "人文學科",
  "secondary-computer": "電腦科",
  "interest-art": "藝術",
  "interest-music": "音樂",
  "interest-dance": "舞蹈",
  "interest-drama": "戲劇",
  "interest-programming": "編程／程式",
  "interest-foreign-language": "外語",
  "interest-magic-chess": "魔術／圍棋",
  "interest-photography": "攝影",
  "interest-language": "語言興趣",
  "uni-liberal": "大學通識",
  "uni-math": "大學數學",
  "uni-economics": "大學經濟",
  "uni-it": "大學資訊科技",
  "uni-business": "大學商業課程",
  "uni-engineering": "大學工程",
  "uni-thesis": "大學論文輔導",
  "undergraduate-programming": "本科程式設計",
  "undergraduate-economics": "本科經濟",
  "undergraduate-statistics": "本科統計",
  "undergraduate-language": "本科語文",
  "undergraduate-accounting": "本科會計",
  "undergraduate-calculus": "本科微積分",
  "postgraduate-thesis": "研究生論文",
  "postgraduate-presentation": "研究生簡報",
  "postgraduate-research": "研究計劃",
  "postgraduate-spss": "SPSS分析",
  "adult-language": "成人語言",
  "adult-workplace": "職場技巧",
  "adult-business": "成人商業課程",
  "business-english": "商業英文",
  "conversation": "會話訓練",
  "chinese-language": "中文能力提升",
  "second-language": "第二語言學習",
  "computer-skills": "電腦技能",
  "exam-prep": "考試預備",
  "drawing": "繪畫",
  "interest-drawing": "繪畫",
  "photography": "攝影",
  "magic-chess": "魔術／棋藝",
  "early-childhood-homework": "幼兒功課輔導",
  "adult-japanese": "成人日語",
  "adult-english": "成人英語",
  "adult-computer-skills": "電腦技能",
  "ib-math": "IB數學",
  "tertiary-ib-math": "IB數學"
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
  createdAt: string
}

interface CaseCardProps {
  caseData?: CaseData
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const router = useRouter()

  if (!caseData) return null // 防止 undefined 時 crash

  console.log('CaseCard received:', caseData);

  const handleClick = () => {
    router.push(`/cases/${caseData.id}`)
  }

  const subjectLabel = caseData.subject?.label
    ? SUBJECT_MAP[caseData.subject.label] || caseData.subject.label
    : '未命名個案';

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <h3 className="text-lg font-semibold text-blue-700 mb-2">
        {subjectLabel}
      </h3>
      <p>地點：{caseData.region?.label || '地點待定'}</p>
      <p>教學模式：{caseData.mode?.label || '教學模式待定'}</p>
      <p>經驗要求：{caseData.experienceLevel?.label || '經驗要求待定'}</p>
      <p>價格：{caseData.budget || '價格待議'}</p>
      <p className="text-sm text-gray-500 mt-2">
        發佈於 {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' }) : '未知日期'}
      </p>
    </div>
  )
} 