'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, caseApi } from '@/services/api';
import CaseCard from '@/components/CaseCard';
import TutorCard from '@/components/TutorCard';
import StudentCaseCard from '@/components/student/StudentCaseCard';
import { getSubjectName, getRegionName, getSubRegionName } from '@/utils/translate';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useIsMobile } from '@/hooks/useMediaQuery';

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
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();
  
  // 根據螢幕大小決定每頁卡片數量
  const cardsPerPage = isMobile ? 4 : 8;

  useEffect(() => {
    let isMounted = true;  // 用於防止記憶體洩漏

    const fetchCases = async () => {
      try {
        setLoading(true);
        console.log(`🔍 正在獲取${routeType === 'tutor' ? '導師' : '個案'}資料...`, { fetchUrl, queryParams });
        
        // 根據 fetchUrl 和 routeType 決定使用哪個 API
        let data;
        if (fetchUrl === '/find-tutor-cases' && routeType === 'tutor') {
          // 導師個案 → 使用 searchByTarget API
          console.log('🎯 使用 searchByTarget API 獲取導師個案');
          data = await caseApi.searchByTarget('find-tutor', queryParams);
        } else {
          // 其他情況 → 使用 fetchApi
          data = await fetchApi(fetchUrl, {}, queryParams);
        }
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

        // 數據格式轉換：將後端數據格式轉換為 CaseCard 期望的格式
        const transformCaseData = (caseItem: any) => {
          // 處理科目
          let subjectLabel = '未指定科目';
          if (caseItem.subjects && Array.isArray(caseItem.subjects) && caseItem.subjects.length > 0) {
            subjectLabel = getSubjectName(caseItem.subjects[0]);
          } else if (caseItem.subject) {
            subjectLabel = getSubjectName(caseItem.subject);
          }

          // 處理地區
          let regionLabel = '未指定地區';
          let regionValue = null;
          if (caseItem.regions && Array.isArray(caseItem.regions) && caseItem.regions.length > 0) {
            regionValue = caseItem.regions[0];
          } else if (caseItem.region) {
            if (Array.isArray(caseItem.region) && caseItem.region.length > 0) {
              regionValue = caseItem.region[0];
            } else if (typeof caseItem.region === 'string') {
              regionValue = caseItem.region;
            }
          }
          if (regionValue) {
            regionLabel = getRegionName(regionValue);
            if (regionLabel === regionValue) {
              regionLabel = getSubRegionName(regionValue);
            }
          }

          // 處理教學模式
          let modes: string[] = [];
          if (caseItem.modes && Array.isArray(caseItem.modes)) {
            modes = caseItem.modes.map((mode: string) => {
              if (mode === 'in-person') return '面授';
              if (mode === 'online') return '網課';
              return mode;
            });
          } else if (caseItem.mode) {
            if (caseItem.mode === 'in-person') modes = ['面授'];
            else if (caseItem.mode === 'online') modes = ['網課'];
            else modes = [caseItem.mode];
          }

          // 處理堂費預算
          let budgetLabel = '堂費預算: 待議';
          if (caseItem.budget) {
            if (typeof caseItem.budget === 'object' && caseItem.budget.min && caseItem.budget.max) {
              budgetLabel = `堂費預算: $${caseItem.budget.min} - $${caseItem.budget.max}`;
            } else if (typeof caseItem.budget === 'string' && caseItem.budget.trim() !== '') {
              budgetLabel = `堂費預算: $${caseItem.budget}`;
            }
          } else if (caseItem.price) {
            budgetLabel = `堂費預算: $${caseItem.price}`;
          }

          // 處理課程詳情
          let lessonDetails = null;
          if (caseItem.lessonDetails) {
            if (typeof caseItem.lessonDetails === 'string') {
              try {
                lessonDetails = JSON.parse(caseItem.lessonDetails);
              } catch (e) {
                console.warn('無法解析 lessonDetails:', caseItem.lessonDetails);
              }
            } else {
              lessonDetails = caseItem.lessonDetails;
            }
          }

          return {
            ...caseItem,
            subject: { label: subjectLabel },
            region: { label: regionLabel },
            budget: caseItem.budget, // 直接使用原始的budget數據
            modes: modes,
            lessonDetails: lessonDetails
          };
        };

        // 轉換數據格式
        const transformedCases = validCases.map(transformCaseData);

        // 排序：加強 fallback，確保 createdAt、date 都無效時 fallback 0
        const getCaseTime = (c: any) => {
          const t = new Date(c.createdAt || c.date || 0);
          return isNaN(t.getTime()) ? 0 : t.getTime();
        };
        const sorted = [...transformedCases].sort((a, b) => getCaseTime(b) - getCaseTime(a));

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

  // 移除 resize 監聽器，因為 useIsMobile hook 已經處理了響應式

  const totalPages = Math.ceil(cases.length / cardsPerPage);
  const pagedCases = cases.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);

  return (
    <div className="py-8 max-sm:py-6 max-[700px]:py-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold border-l-4 pl-3" style={{ borderColor: routeType === 'tutor' ? '#fde047' : '#60a5fa' }}>{title}</h2>
      </div>

      <div className="relative">
        <button
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : (routeType === 'tutor' ? 'bg-yellow-200 text-yellow-600' : 'bg-blue-200 text-blue-600 cursor-pointer hover:bg-blue-300')} transition`}
          style={{ transform: 'translateY(-50%)' }}
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          aria-label="上一頁"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-6`}>
          {pagedCases.map((caseItem: Case) => (
            routeType === 'tutor'
              ? <TutorCard key={caseItem.tutorId} tutor={caseItem as any} />
              : <StudentCaseCard key={caseItem.id} case={caseItem as any} />
          ))}
        </div>
        <button
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border ${currentPage === totalPages - 1 || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : (routeType === 'tutor' ? 'bg-yellow-200 text-yellow-600' : 'bg-blue-200 text-blue-600 cursor-pointer hover:bg-blue-300')} transition`}
          style={{ transform: 'translateY(-50%)' }}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          aria-label="下一頁"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-8 text-center max-sm:mt-6 max-[700px]:mt-8">
        <Link
          href={linkUrl}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 max-sm:text-sm max-[700px]:text-sm"
        >
          查看更多 →
        </Link>
      </div>
    </div>
  );
};

export default CaseSection; 