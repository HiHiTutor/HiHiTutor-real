interface SubjectBarProps {
  name: string;
  percent: number;
}

export const SubjectBar = ({ name, percent }: SubjectBarProps) => (
  <div>
    <div className="flex justify-between text-sm mb-1 max-sm:text-xs max-sm:mb-0.5 max-[700px]:text-sm max-[700px]:mb-1">
      <span>{name}</span>
      <span>{percent}%</span>
    </div>
    <div className="bg-gray-200 h-2 rounded max-sm:h-1.5 max-[700px]:h-2">
      <div className="bg-yellow-400 h-2 rounded max-sm:h-1.5 max-[700px]:h-2" style={{ width: `${percent}%` }} />
    </div>
  </div>
); 