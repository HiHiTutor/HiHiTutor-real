interface Case {
  id: number;
  subject: string;
  grade: string;
  location: string;
  salary: string;
  frequency: string;
  requirements: string;
  status: string;
}

interface CaseCardProps {
  caseItem: Case;
}

const CaseCard = ({ caseItem }: CaseCardProps) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{caseItem.subject}</h3>
        <span className="text-sm px-2 py-1 bg-red-100 text-red-600 rounded-full">
          {caseItem.status}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">年級:</span> {caseItem.grade}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">地點:</span> {caseItem.location}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">薪金:</span> {caseItem.salary}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">頻率:</span> {caseItem.frequency}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">要求:</span> {caseItem.requirements}
        </p>
      </div>
    </div>
  );
};

export default CaseCard; 