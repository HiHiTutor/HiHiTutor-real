'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/services/api';
import CaseCard from '@/components/CaseCard';
import TutorCard from '@/components/TutorCard';
import SUBJECT_MAP from '@/constants/subjectOptions';

// 科目映射表
const subjectMap: { [key: string]: string } = {
  // 幼兒教育
  'early-childhood-chinese': '中文',
  'early-childhood-english': '英文',
  'early-childhood-math': '數學',
  
  // 小學教育
  'primary-chinese': '中文',
  'primary-english': '英文',
  'primary-math': '數學',
  'primary-general': '常識／科學',
  'primary-stem': '常識／STEM',
  
  // 中學教育
  'secondary-chinese': '中文',
  'secondary-english': '英文',
  'secondary-math': '數學',
  'secondary-ls': '通識教育',
  'secondary-humanities': '綜合人文／社會',
  'secondary-economics': '經濟／商業',
  'secondary-computer': '電腦科學／ICT',
  'secondary-dse': 'DSE 專科補習',
  'secondary-all': '全科',
  
  // 大學本科
  'undergraduate-calculus': '微積分',
  'undergraduate-economics': '經濟學',
  'undergraduate-statistics': '統計學',
  'undergraduate-accounting': '會計',
  'undergraduate-programming': '編程',
  'undergraduate-language': '語言',
  
  // 研究生
  'postgraduate-thesis': '論文寫作',
  'postgraduate-research': '研究設計',
  'postgraduate-spss': 'SPSS',
  'postgraduate-presentation': '簡報技巧',
  
  // 興趣班
  'interest-music': '音樂',
  'interest-art': '畫畫',
  'interest-programming': '編程',
  'interest-language': '語言',
  
  // 成人教育
  'adult-business': '商業寫作',
  'adult-language': '語言進修',
  'adult-workplace': '職場技能'
};

// 地區映射表
const regionMap: { [key: string]: string } = {
  // 香港島
  'hong-kong-island': '香港島',
  'central-western': '中上環',
  'sai-ying-pun': '西營盤',
  'shek-tong-tsui': '石塘咀',
  'wan-chai': '灣仔',
  'admiralty': '金鐘',
  'causeway-bay': '銅鑼灣',
  'happy-valley': '跑馬地',
  'tin-hau': '天后',
  'tai-hang': '大坑',
  'north-point': '北角',
  'fortress-hill': '炮台山',
  'braemar-hill': '北角半山',
  'quarry-bay': '鰂魚涌',
  'taikoo': '太古城',
  'sai-wan-ho': '西灣河',
  'shau-kei-wan': '筲箕灣',
  'heng-fa-chuen': '杏花邨',
  'chai-wan': '柴灣',
  'siu-sai-wan': '小西灣',
  'shek-o': '石澳',
  'aberdeen': '香港仔',
  'ap-lei-chau': '鴨脷洲',
  'wong-chuk-hang': '黃竹坑',
  'southern': '南區',
  
  // 九龍
  'kowloon': '九龍',
  'tsim-sha-tsui': '尖沙咀',
  'jordan': '佐敦',
  'yau-ma-tei': '油麻地',
  'mong-kok': '旺角',
  'prince-edward': '太子',
  'sham-shui-po': '深水埗',
  'cheung-sha-wan': '長沙灣',
  'hung-hom': '紅磡',
  'to-kwa-wan': '土瓜灣',
  'ho-man-tin': '何文田',
  'kowloon-tong': '九龍塘',
  'san-po-kong': '新蒲崗',
  'diamond-hill': '鑽石山',
  'lok-fu': '樂富',
  'tsz-wan-shan': '慈雲山',
  'ngau-tau-kok': '牛頭角',
  'lam-tin': '藍田',
  'kwun-tong': '觀塘',
  'yau-tong': '油塘',
  'kowloon-city': '九龍城',
  'wong-tai-sin': '黃大仙',
  
  // 新界
  'new-territories': '新界',
  'tsuen-wan': '荃灣',
  'kwai-chung': '葵涌',
  'kwai-fong': '葵芳',
  'tsing-yi': '青衣',
  'tuen-mun': '屯門',
  'yuen-long': '元朗',
  'tin-shui-wai': '天水圍',
  'sheung-shui': '上水',
  'fan-ling': '粉嶺',
  'tai-wo': '太和',
  'tai-po': '大埔',
  'ma-on-shan': '馬鞍山',
  'sha-tin': '沙田',
  'fo-tan': '火炭',
  'tseung-kwan-o': '將軍澳',
  'sai-kung': '西貢',
  'clear-water-bay': '清水灣',
  'hang-hau': '坑口',
  'tiu-keng-leng': '調景嶺',
  'long-ping': '朗屏',
  'kam-sheung-road': '錦上路',
  'shek-mun': '石門',
  
  // 離島
  'islands': '離島',
  'tung-chung': '東涌',
  'sunny-bay': '欣澳',
  'mui-wo': '梅窩',
  'discovery-bay': '愉景灣',
  'cheung-chau': '長洲',
  'lamma-island': '南丫島',
  'ping-chau': '坪洲',
  'tai-o': '大澳'
};

// 授課模式映射
const modeMap: { [key: string]: string } = {
  'online': '網課',
  'in-person': '面授'
};

// 個案資料類型定義
interface Case {
  id?: string;
  tutorId?: string;
  category: string;
  subCategory?: string;
  subjects?: string[];
  region?: string;
  subRegion?: string;
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
  avatarUrl?: string;
  name?: string;
  subject?: string;
  education?: string;
  isVip?: boolean;
  isTop?: boolean;
  rating?: number;
  // 其他可能欄位
  [key: string]: any;
}

interface CaseSectionProps {
  title: string;
  fetchUrl: string;
  linkUrl: string;
  borderColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
  routeType?: 'student' | 'tutor';
}

// 預算顯示組件
const BudgetDisplay = ({ budget }: { budget: any }) => {
  if (!budget || typeof budget !== 'object') {
    return <span>價格待議</span>;
  }
  
  const min = budget.min || 0;
  const max = budget.max || 0;
  
  return <span>{`${min} - ${max}/小時`}</span>;
};

const CaseSection = ({ title, fetchUrl, linkUrl, borderColor = 'border-blue-400', bgColor = 'bg-blue-50', icon, routeType }: CaseSectionProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;  // 用於防止記憶體洩漏

    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(fetchUrl);
        
        // 處理不同格式的回應
        let rawCases: Case[] = [];
        
        if (Array.isArray(data)) {
          rawCases = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.cases)) {
            rawCases = data.cases;
          } else if (Array.isArray(data.data?.cases)) {
            rawCases = data.data.cases;
          } else if (Array.isArray(data.data?.tutors)) {
            // Directly use the tutor data from the API without re-mapping
            rawCases = data.data.tutors;
          } else if (Array.isArray(data.data)) {
            rawCases = data.data;
          }
        }
        
        // 過濾並排序（只要有 createdAt 或 date 就顯示）
        const validCases = rawCases.filter(case_ => 
          case_ && 
          typeof case_ === 'object' && 
          (case_.createdAt || case_.date || case_.tutorId || case_.id)
        );

        // 排序：VIP置頂好評 > VIP置頂 > 置頂好評 > 置頂 > 好評 > 其他
        const getSortScore = (c: any) => [
          c.isVip ? 1 : 0,
          c.isTop ? 1 : 0,
          c.rating >= 4.5 ? 1 : 0,
          c.rating || 0,
          new Date(c.createdAt || c.date || 0).getTime()
        ];
        const sorted = [...validCases].sort((a, b) => {
          const sa = getSortScore(a);
          const sb = getSortScore(b);
          for (let i = 0; i < sa.length; i++) {
            if (sa[i] !== sb[i]) return sb[i] - sa[i];
          }
          return 0;
        });

        if (isMounted) {
          setCases(sorted);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
        if (isMounted) {
          setError('載入失敗，請稍後再試');
          setCases([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCases();

    return () => {
      isMounted = false;
    };
  }, [fetchUrl]);

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">{title}</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>目前沒有{routeType === 'tutor' ? '導師' : '個案'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((caseItem: Case) => (
            routeType === 'tutor' ? (
              <TutorCard key={caseItem.id} tutor={caseItem as any} />
            ) : (
              <CaseCard key={caseItem.id} caseData={caseItem as any} routeType={routeType} />
            )
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href={linkUrl}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          查看更多 →
        </Link>
      </div>
    </div>
  );
};

export default CaseSection; 