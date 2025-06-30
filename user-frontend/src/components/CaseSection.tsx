'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/services/api';
import CaseCard from '@/components/CaseCard';
import TutorCard from '@/components/TutorCard';
import { getSubjectName } from '@/utils/translate';

// 地區映射表
const regionMap: { [key: string]: string } = {
  // 香港島
  'central': '中環',
  'sheung-wan': '上環',
  'sai-wan': '西環',
  'sai-ying-pun': '西營盤',
  'shek-tong-tsui': '石塘咀',
  'wan-chai': '灣仔',
  'causeway-bay': '銅鑼灣',
  'admiralty': '金鐘',
  'happy-valley': '跑馬地',
  'tin-hau': '天后',
  'tai-hang': '大坑',
  'north-point': '北角',
  'quarry-bay': '鰂魚涌',
  'taikoo': '太古',
  'sai-wan-ho': '西灣河',
  'shau-kei-wan': '筲箕灣',
  'chai-wan': '柴灣',
  'heng-fa-chuen': '杏花邨',
  
  // 九龍
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
  
  // 新界
  'sha-tin': '沙田',
  'ma-on-shan': '馬鞍山',
  'tai-wai': '大圍',
  'fo-tan': '火炭',
  'tai-po': '大埔',
  'tai-wo': '太和',
  'fan-ling': '粉嶺',
  'sheung-shui': '上水',
  'tseung-kwan-o': '將軍澳',
  'hang-hau': '坑口',
  'po-lam': '寶琳',
  'lohas-park': '康城',
  'tuen-mun': '屯門',
  'siu-hong': '兆康',
  'yuen-long': '元朗',
  'long-ping': '朗屏',
  'tin-shui-wai': '天水圍',
  'tsuen-wan': '荃灣',
  'kwai-fong': '葵芳',
  'kwai-chung': '葵涌',
  'tsing-yi': '青衣',
  'kam-sheung-road': '錦上路',
  'sai-kung': '西貢',
  
  // 離島
  'tung-chung': '東涌',
  'mui-wo': '梅窩',
  'tai-o': '大澳',
  'ping-chau': '坪洲',
  'cheung-chau': '長洲',
  'lamma-island': '南丫島',
  'discovery-bay': '愉景灣',
  'pui-o': '貝澳'
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
  queryParams?: Record<string, any>;
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

const CaseSection = ({ title, fetchUrl, linkUrl, borderColor = 'border-blue-400', bgColor = 'bg-blue-50', icon, routeType, queryParams }: CaseSectionProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;  // 用於防止記憶體洩漏

    const fetchCases = async () => {
      try {
        setLoading(true);
        console.log(`🔍 正在獲取${routeType === 'tutor' ? '導師' : '個案'}資料...`, { fetchUrl, queryParams });
        
        // 使用 fetchApi 並傳遞查詢參數
        const data = await fetchApi(fetchUrl, {}, queryParams);
        console.log(`📦 成功獲取${routeType === 'tutor' ? '導師' : '個案'}資料：`, data);
        
        // 處理不同格式的回應
        let rawCases: Case[] = [];
        
        if (Array.isArray(data)) {
          rawCases = data;
          console.log('📋 從陣列回應中獲取資料');
        } else if (data && typeof data === 'object') {
          // 檢查 MongoDB 連接狀態
          if (data.mongoState === 2) {
            console.warn('⚠️ MongoDB 正在連接中，資料可能不完整');
          }
          
          if (Array.isArray(data.cases)) {
            rawCases = data.cases;
            console.log('📋 從 data.cases 中獲取資料');
          } else if (Array.isArray(data.tutors)) {
            rawCases = data.tutors;
            console.log('📋 從 data.tutors 中獲取資料');
          } else if (Array.isArray(data.data?.cases)) {
            rawCases = data.data.cases;
            console.log('📋 從 data.data.cases 中獲取資料');
          } else if (Array.isArray(data.data?.tutors)) {
            rawCases = data.data.tutors;
            console.log('📋 從 data.data.tutors 中獲取資料');
          } else if (Array.isArray(data.data)) {
            rawCases = data.data;
            console.log('📋 從 data.data 中獲取資料');
          } else {
            console.warn('⚠️ 無法識別回應格式:', data);
          }
        }
        
        console.log(`📊 原始資料數量: ${rawCases.length}`);
        
        // 過濾並排序（只要有 id 或 name 就顯示）
        const validCases = rawCases.filter(case_ => {
          const isValid = case_ && 
            typeof case_ === 'object' && 
            (case_.id || case_.userId || case_.name || case_.createdAt || case_.date || case_.tutorId);
          
          if (!isValid) {
            console.log('❌ 過濾掉的資料:', case_);
          }
          
          return isValid;
        });
        
        console.log(`✅ 有效資料數量: ${validCases.length}`);
        
        if (validCases.length === 0) {
          console.warn('⚠️ 沒有有效的資料，可能的原因：');
          console.warn('- API 回應格式不正確');
          console.warn('- 資料庫中沒有相關資料');
          console.warn('- 查詢參數過濾過於嚴格');
          console.warn('原始回應:', data);
          console.warn('原始資料陣列:', rawCases);
        }

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
          console.log(`🎉 成功載入 ${sorted.length} 個${routeType === 'tutor' ? '導師' : '個案'}`);
        }
      } catch (err) {
        console.error(`❌ 獲取${routeType === 'tutor' ? '導師' : '個案'}資料時發生錯誤：`, err);
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
  }, [fetchUrl, queryParams, routeType]);

  return (
    <div className="py-8 max-sm:py-6">
      <div className="flex items-center gap-2 mb-6 max-sm:gap-1 max-sm:mb-4">
        <span className="text-2xl max-sm:text-xl">{icon}</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3 max-sm:text-xl max-sm:pl-2">{title}</h2>
      </div>

      {loading ? (
        <div className="text-center py-8 max-sm:py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 max-sm:h-6 max-sm:w-6"></div>
          <p className="mt-2 text-gray-600 max-sm:text-sm">載入中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 max-sm:py-6">
          <p className="max-sm:text-sm">{error}</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-8 text-gray-500 max-sm:py-6">
          <p className="max-sm:text-sm">目前沒有{routeType === 'tutor' ? '導師' : '個案'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:grid-cols-1 max-sm:gap-4">
          {cases.map((caseItem: Case) => {
            if (routeType === 'tutor') {
              if (!caseItem.tutorId) return null;
              return <TutorCard key={caseItem.tutorId} tutor={caseItem as any} />;
            } else {
              return <CaseCard key={caseItem.id} caseData={caseItem as any} routeType={routeType} />;
            }
          })}
        </div>
      )}

      <div className="mt-8 text-center max-sm:mt-6">
        <Link
          href={linkUrl}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 max-sm:text-sm"
        >
          查看更多 →
        </Link>
      </div>
    </div>
  );
};

export default CaseSection; 