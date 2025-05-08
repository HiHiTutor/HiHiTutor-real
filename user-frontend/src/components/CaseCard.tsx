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
  "exam-prep": "考試預備"
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

interface CaseCardProps {
  caseItem: {
    id?: string;
    tutorId?: string;
    category?: string;
    subCategory?: string;
    subjects?: string[];
    region?: string;
    subRegion?: string | string[];
    mode?: string;
    modes?: string[];
    regions?: string[];
    subRegions?: string[];
    budget?: {
      min?: number;
      max?: number;
    };
    price?: string;
    experience?: string;
    featured?: boolean;
    date?: string;
    createdAt?: string;
    [key: string]: any;
  };
  onClick?: () => void;
}

export default function CaseCard({ caseItem, onClick }: CaseCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未提供發佈日期';
    try {
      return new Date(dateString).toLocaleDateString('zh-HK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '日期格式錯誤';
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="space-y-3">
        <p className="text-md font-semibold text-gray-700">
          {caseItem.subjects?.length
            ? caseItem.subjects.map(s => SUBJECT_MAP[s] || getSubjectNames([s], caseItem.category, caseItem.subCategory) || s).join('、')
            : '科目待定'}
        </p>
        
        <p className="text-sm text-gray-700">
          地點：{getRegionName(caseItem.region)}
          {caseItem.subRegion ? '・' : ''}
          {Array.isArray(caseItem.subRegion)
            ? caseItem.subRegion.map(sr => SUB_REGION_MAP[sr] || getSubRegionName(sr) || sr).join('、')
            : (SUB_REGION_MAP[caseItem.subRegion] || getSubRegionName(caseItem.subRegion) || caseItem.subRegion)}
        </p>

        <p className="text-sm text-gray-700">
          {MODES && MODES[caseItem.mode] || caseItem.mode || '教學模式待定'}
        </p>

        <p className="text-sm text-gray-700">
          {caseItem.experience || '經驗要求待定'}
        </p>

        <p className="font-semibold text-yellow-600">
          {caseItem.budget?.min && caseItem.budget?.max
            ? `$${caseItem.budget.min}\n- $${caseItem.budget.max}/小時`
            : '價格待議'}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          發佈於 {formatDate(caseItem.createdAt || caseItem.date)}
        </p>
      </div>
    </div>
  );
} 