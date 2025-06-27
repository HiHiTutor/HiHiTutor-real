import { formatDate } from '@/utils/date';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';

interface StudentCase {
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

interface StudentCaseCardProps {
  case: StudentCase;
}

export default function StudentCaseCard({ case: caseData }: StudentCaseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold text-blue-900">
        {caseData.title || '未命名個案'}
      </h3>
      <p className="text-sm text-gray-700">地點：{caseData.region}</p>
      <p className="text-sm text-gray-700">教學模式：{getTeachingModeLabel(caseData.mode)}</p>
      <p className="text-sm text-gray-700">經驗要求：{caseData.experience}</p>
      <p className="text-sm text-gray-700">
        價格：{caseData.budget.min} - {caseData.budget.max}
      </p>

      <div className="mt-4 text-xs text-right text-gray-400">
        發佈於：{formatDate(caseData.createdAt)}
      </div>
    </div>
  );
} 