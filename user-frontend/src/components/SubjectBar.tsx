interface SubjectBarProps {
  name: string;
  percent: number;
}

export const SubjectBar = ({ name, percent }: SubjectBarProps) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{name}</span>
      <span>{percent}%</span>
    </div>
    <div className="bg-gray-200 h-2 rounded">
      <div className="bg-yellow-400 h-2 rounded" style={{ width: `${percent}%` }} />
    </div>
  </div>
); 