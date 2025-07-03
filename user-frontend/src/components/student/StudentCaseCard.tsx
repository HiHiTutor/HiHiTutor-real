import { formatDate } from '@/utils/date';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';

interface StudentCase {
  id: string;
  _id?: string;
  title?: string;
  region?: string;
  regions?: string[];
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

export default function StudentCaseCard({ case: caseData }: StudentCaseCardProps) {
  // 處理地區顯示
  const displayRegion = caseData.region || (caseData.regions && caseData.regions.length > 0 ? caseData.regions[0] : '未指定');
  
  // 處理教學模式顯示
  const displayMode = caseData.mode || (caseData.modes && caseData.modes.length > 0 ? caseData.modes[0] : '未指定');
  
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
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all max-sm:p-3 max-[700px]:p-4">
      <h3 className="text-lg font-semibold text-blue-900 max-sm:text-base max-[700px]:text-lg">
        {caseData.title || '未命名個案'}
      </h3>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">地點：{displayRegion}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">教學模式：{getTeachingModeLabel(displayMode)}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">經驗要求：{displayExperience}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">
        價格：{displayBudget}
      </p>

      <div className="mt-4 text-xs text-right text-gray-400 max-sm:mt-3 max-[700px]:mt-4">
        發佈於：{formatDate(caseData.createdAt)}
      </div>
    </div>
  );
} 