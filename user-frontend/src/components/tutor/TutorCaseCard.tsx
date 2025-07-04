import { formatDate } from '@/utils/date';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';

interface TutorCase {
  id: string;
  title?: string;
  region: string;
  mode: string;
  experience: string;
  budget: {
    min: number;
    max: number;
  };
  createdAt: string;
}

interface TutorCaseCardProps {
  case: TutorCase;
}

export default function TutorCaseCard({ case: caseData }: TutorCaseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all max-sm:p-3 max-[700px]:p-4">
      <h3 className="text-lg font-semibold text-blue-900 max-sm:text-base max-[700px]:text-lg">
        {caseData.title || '未命名個案'}
      </h3>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">地點：{caseData.region}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">教學模式：{getTeachingModeLabel(caseData.mode)}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">經驗要求：{caseData.experience}</p>
      <p className="text-sm text-gray-700 max-sm:text-xs max-[700px]:text-sm">
        價格：{caseData.budget.min} - {caseData.budget.max}
      </p>

      <div className="mt-4 text-xs text-right text-gray-400 max-sm:mt-3 max-[700px]:mt-4">
        發佈於：{formatDate(caseData.createdAt)}
      </div>
    </div>
  );
} 