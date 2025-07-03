import { formatDate } from '@/utils/date';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';
import REGION_OPTIONS from '@/constants/regionOptions';

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
  // 先找大區
  const mainRegion = REGION_OPTIONS.find(opt => opt.value === value);
  if (mainRegion) return mainRegion.label;
  // 再找細分地區
  for (const region of REGION_OPTIONS) {
    const sub = region.regions.find(r => r.value === value);
    if (sub) return sub.label;
  }
  return value;
}

export default function StudentCaseCard({ case: caseData }: StudentCaseCardProps) {
  // mode 顯示
  const displayMode = caseData.mode
    ? getTeachingModeLabel(caseData.mode)
    : (caseData.modes && caseData.modes.length > 0
        ? getTeachingModeLabel(caseData.modes[0])
        : '未指定');
  
  // 地點顯示邏輯
  let displayRegion = '—';
  const modesArr = caseData.modes || (caseData.mode ? [caseData.mode] : []);
  const isOnlineOnly = modesArr.length === 1 && (modesArr[0] === 'online' || modesArr[0] === '線上');
  if (!isOnlineOnly) {
    if (Array.isArray(caseData.subRegions) && caseData.subRegions.length > 0) {
      displayRegion = caseData.subRegions.map(r => getRegionLabel(r)).join('、');
    } else if (Array.isArray(caseData.regions) && caseData.regions.length > 0 && caseData.regions[0] !== 'all-hong-kong') {
      displayRegion = caseData.regions.map(r => getRegionLabel(r)).join('、');
    } else if (Array.isArray(caseData.regions) && caseData.regions[0] === 'all-hong-kong') {
      displayRegion = '全港';
    } else if (Array.isArray(caseData.region) && caseData.region.length > 0) {
      displayRegion = caseData.region.map(r => getRegionLabel(r)).join('、');
    } else {
      displayRegion = '未指定';
    }
  }
  
  // 處理經驗要求顯示
  const displayExperience = caseData.experience || caseData.experienceLevel || caseData.requirement || '未指定';
  
  // 處理價格顯示
  const displayBudget = (() => {
    if (typeof caseData.budget === 'string') return caseData.budget;
    if (typeof caseData.budget === 'number') return `$${caseData.budget}`;
    if (caseData.budget && typeof caseData.budget === 'object') {
      return `${caseData.budget.min} - ${caseData.budget.max}`;
    }
    return '待議';
  })();

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-blue-200 hover:shadow-lg hover:border-blue-300 transition-all max-sm:p-3 max-[700px]:p-4 bg-gradient-to-br from-white to-blue-50">
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
          <span className="w-16 text-blue-600 font-medium">地點：</span>
          <span>{displayRegion}</span>
        </div>
        <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
          <span className="w-16 text-blue-600 font-medium">模式：</span>
          <span>{displayMode}</span>
        </div>
        <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
          <span className="w-16 text-blue-600 font-medium">經驗：</span>
          <span>{displayExperience}</span>
        </div>
        <div className="flex items-center text-sm text-blue-800 max-sm:text-xs max-[700px]:text-sm">
          <span className="w-16 text-blue-600 font-medium">價格：</span>
          <span className="font-semibold text-blue-900">{displayBudget}</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-right text-blue-500 max-sm:mt-3 max-[700px]:mt-4 border-t border-blue-100 pt-2">
        發佈於：{formatDate(caseData.createdAt)}
      </div>
    </div>
  );
} 