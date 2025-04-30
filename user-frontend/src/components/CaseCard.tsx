import { MODES, getFullRegionName, getSubjectNames, getSubRegionName } from '@/utils/translate';

interface CaseCardProps {
  caseItem: {
    id: string;
    category: string;
    subCategory: string;
    subjects: string[];
    region: string;
    subRegion: string | string[];
    mode: string;
    budget: {
      min: number;
      max: number;
    };
    experience: string;
    date: string;
  };
  onClick?: () => void;
}

export default function CaseCard({ caseItem, onClick }: CaseCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="space-y-3">
        <p className="text-md font-semibold text-gray-700">
          {caseItem.subjects?.length
            ? getSubjectNames(caseItem.subjects, caseItem.category, caseItem.subCategory)
            : '科目待定'}
        </p>
        
        <p className="text-sm text-gray-700">
          地點：{Array.isArray(caseItem.subRegion) 
            ? caseItem.subRegion.map(getSubRegionName).join('、') 
            : getSubRegionName(caseItem.subRegion)}
        </p>

        <p className="text-sm text-gray-700">
          {MODES[caseItem.mode] || caseItem.mode || '教學模式待定'}
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
          發佈於 {caseItem.date ? new Date(caseItem.date).toLocaleDateString() : '未提供發佈日期'}
        </p>
      </div>
    </div>
  );
} 