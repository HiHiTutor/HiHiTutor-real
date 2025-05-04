'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  id: string;
  category: string;
  subCategory: string;
  subjects: string[];
  region: string;
  subRegion: string;
  mode: string;
  budget: {
    min: number;
    max: number;
  };
  experience: string;
  featured: boolean;
  date: string;
}

interface CaseSectionProps {
  title: string;
  fetchUrl: string;
  linkUrl: string;
  borderColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
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

const CaseSection = ({ title, fetchUrl, linkUrl, borderColor = 'border-blue-400', bgColor = 'bg-blue-50', icon }: CaseSectionProps) => {
  console.log("CaseSection 正確載入 ✅", { title, fetchUrl });
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${fetchUrl}`);
        if (response.ok) {
          const data = await response.json();
          
          // 處理不同格式的回應
          let casesData: Case[] = [];
          
          if (Array.isArray(data)) {
            // 格式 a: 直接為陣列
            casesData = data;
          } else if (data && typeof data === 'object') {
            // 格式 b: 包含陣列屬性的物件
            if (Array.isArray(data.cases)) {
              casesData = data.cases;
            } else if (Array.isArray(data.data?.cases)) {
              casesData = data.data.cases;
            } else if (Array.isArray(data.data)) {
              casesData = data.data;
            }
          }
          
          // 確保資料是有效的 Case 物件陣列
          const validCases = casesData.filter(case_ => 
            case_ && 
            typeof case_ === 'object' && 
            'id' in case_ && 
            'category' in case_
          );
          
          setCases(validCases);
          setError(null);
        } else {
          throw new Error('Failed to fetch cases');
        }
      } catch (err) {
        console.error('獲取個案失敗:', err);
        setError('獲取個案失敗，請稍後再試');
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [fetchUrl]);

  const limitedCases = Array.isArray(cases) ? cases.slice(0, 8) : [];

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className={`text-2xl font-bold border-l-4 ${borderColor} pl-3`}>{title}</h2>
      </div>
      <div className={`${bgColor} border ${borderColor.replace('border-', 'border-')} rounded-xl p-4`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">載入中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : limitedCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>目前沒有個案</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {limitedCases.map((case_, index) => (
              <div
                key={`${case_.id}-${index}`}
                onClick={() => router.push(`${linkUrl}/${case_.id}`)}
                className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm text-start cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                <div className="font-bold text-lg mb-1">{subjectMap[case_.subjects[0]] || case_.subjects[0]}</div>
                <div className="text-base mb-1">{regionMap[case_.subRegion] || case_.subRegion}</div>
                <div className="text-base mb-1">
                  <BudgetDisplay budget={case_.budget} />
                </div>
                <div className="text-base mb-1">{modeMap[case_.mode] || case_.mode}</div>
                {case_.experience && <div className="text-base">{case_.experience}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            href={linkUrl}
            className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200"
          >
            查看更多個案
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseSection; 