import * as React from 'react';

export function SubjectBar({ name, percent }: { name: string; percent: number }) {
  return (
    <div className="flex items-center w-full min-[700px]:max-[1023px]:flex-wrap min-[700px]:max-[1023px]:gap-x-2">
      <span className="text-gray-700 font-medium min-[700px]:max-[1023px]:text-sm">{name}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2 overflow-hidden min-[700px]:max-[1023px]:max-w-full min-[700px]:max-[1023px]:truncate">
        <div
          className="bg-yellow-400 h-3 rounded-full"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <span className="text-gray-600 text-xs font-semibold min-[700px]:max-[1023px]:pr-2">{percent}%</span>
    </div>
  );
} 