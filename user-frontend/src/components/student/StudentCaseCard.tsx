console.log("StudentCaseCard rendered v3");
import { formatDate } from '@/utils/date';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';
import REGION_OPTIONS from '@/constants/regionOptions';
import SUBJECT_OPTIONS from '@/constants/subjectOptions';
import Link from 'next/link';
import { getSubjectName } from '@/constants/subjectOptions';
import { getModeName } from '@/utils/translate';

interface StudentCase {
  id: string;
  _id?: string;
  title?: string;
  region?: string;
  regions?: string[];
  subRegions?: string[];
  mode?: string;
  modes?: string[];
  experience?: string;
  experienceLevel?: string;
  requirement?: string;
  budget?: {
    min: number;
    max: number;
  } | string | number;
  subjects?: string[];
  subject?: string;
  category?: string;
  subCategory?: string;
  duration?: number;
  durationUnit?: string;
  weeklyLessons?: number;
  featured?: boolean;
  isVip?: boolean;
  isTop?: boolean;
  ratingScore?: number;
  ratingCount?: number;
  isPaid?: boolean;
  paymentType?: string;
  createdAt: string;
}

interface StudentCaseCardProps {
  case: StudentCase;
}

function getRegionLabel(value: string) {
  if (!value) return '未指定';
  
  // 調試日誌：檢查地區值
  console.log('🔍 getRegionLabel 輸入值：', value);
  
  // 地區值映射表 - 處理測試數據中的地區值
  const regionValueMap: { [key: string]: string } = {
    'kowloon': 'kowloon',
    'hong-kong-island': 'hong-kong-island',
    'new-territories': 'new-territories',
    'islands': 'islands',
    'all-hong-kong': 'all-hong-kong',
    'unlimited': 'unlimited'
  };
  
  // 如果輸入值在映射表中，使用映射後的值
  const mappedValue = regionValueMap[value] || value;
  
  // 先找大區
  const mainRegion = REGION_OPTIONS?.find(opt => opt.value === mappedValue);
  if (mainRegion) {
    console.log('🔍 找到大區：', mainRegion.label);
    return mainRegion.label;
  }
  
  // 再找細分地區
  for (const region of REGION_OPTIONS) {
    const sub = region.regions?.find(r => r.value === mappedValue);
    if (sub) {
      console.log('🔍 找到子地區：', sub.label);
      return sub.label;
    }
  }
  
  console.log('🔍 未找到地區標籤，返回原值：', value);
  return value;
}

// 兼容 object array / string array 顯示（針對科目）
const formatSubjects = (arr: any[] | undefined) => {
  if (!Array.isArray(arr)) return '';
  if (arr.length > 0 && typeof arr[0] === 'object' && arr[0].label) {
    return arr.map(x => x.label).join('、');
  }
  return arr.map(s => getSubjectName(s)).join('、');
};

export default function StudentCaseCard({ case: caseData }: StudentCaseCardProps) {
  // 1. 科目顯示
  const displaySubjects = formatSubjects(caseData.subjects);

  // 2. 模式顯示 - 改善邏輯支援多個模式和中文值
  let displayMode = '未指定';
  if (caseData.modes && Array.isArray(caseData.modes) && caseData.modes.length > 0) {
    // 處理多個模式
    const modeNames = caseData.modes.map(mode => getModeName(mode));
    displayMode = modeNames.join('、');
  } else if (caseData.mode) {
    // 處理單一模式
    displayMode = getModeName(caseData.mode);
  }

  // 3. 地點顯示
  let displayRegion = '';
  
  // 調試日誌：檢查地區數據
  console.log('🔍 StudentCaseCard 地區數據：', {
    id: caseData.id,
    regions: caseData.regions,
    subRegions: caseData.subRegions,
    mode: caseData.mode,
    modes: caseData.modes
  });
  
  if (displayMode.includes('網課')) {
    displayRegion = '網課';
  } else {
    const subRegions = caseData.subRegions || [];
    if (subRegions.length > 0) {
      displayRegion = subRegions.slice(0, 3).map(r => getRegionLabel(r)).join('、');
      if (subRegions.length > 3) displayRegion += ' +';
    } else if (caseData.regions && caseData.regions.length > 0) {
      const regions = caseData.regions.filter(r => r !== 'all-hong-kong' && r !== 'unlimited');
      if (regions.length > 0) {
        displayRegion = regions.slice(0, 3).map(r => getRegionLabel(r)).join('、');
        if (regions.length > 3) displayRegion += ' +';
      } else if (caseData.regions[0] === 'all-hong-kong') {
        displayRegion = '全港';
      } else {
        displayRegion = '未指定';
      }
    } else {
      displayRegion = '未指定';
    }
  }
  
  console.log('🔍 最終顯示的地點：', displayRegion);

  // 4. 每堂預算（不換行）
  let displayBudget = '待議';
  if (typeof caseData.budget === 'number') {
    displayBudget = `HK$ ${caseData.budget}`;
  } else if (typeof caseData.budget === 'string') {
    displayBudget = `HK$ ${caseData.budget}`;
  } else if (caseData.budget && typeof caseData.budget === 'object' && typeof caseData.budget.min === 'number') {
    displayBudget = `HK$ ${caseData.budget.min}`;
  }

  return (
    <Link href={`/find-student-cases/${caseData.id}`}
      className="block group" prefetch={false} scroll={true}>
      <div className="bg-white rounded-2xl shadow-md p-4 border border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all max-sm:p-3 max-[700px]:p-4 bg-gradient-to-br from-white to-blue-50 group-hover:ring-2 group-hover:ring-blue-300 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900 max-sm:text-base max-[700px]:text-lg">
            {caseData.title || '未命名個案'}
          </h3>
          <div className="flex gap-1">
            {caseData.featured && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">推薦</span>
            )}
            {caseData.isVip && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">VIP</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
            <span className="w-16 text-blue-600 font-medium">科目：</span>
            <span className="line-clamp-2 overflow-hidden text-ellipsis flex-1">{displaySubjects || '未指定'}</span>
          </div>
          <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
            <span className="w-16 text-blue-600 font-medium">模式：</span>
            <span>{displayMode}</span>
          </div>
          <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
            <span className="w-16 text-blue-600 font-medium">地點：</span>
            <span>{displayRegion}</span>
          </div>
          <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
            <span className="w-16 text-blue-600 font-medium">每堂預算：</span>
            <span className="font-semibold text-blue-900 whitespace-nowrap truncate flex-1">{displayBudget}</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-right text-blue-500 max-sm:mt-3 max-[700px]:mt-4 border-t border-blue-100 pt-2">
          發佈於：{formatDate(caseData.createdAt)}
        </div>
      </div>
    </Link>
  );
} 