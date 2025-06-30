'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { getRegionName, getSubjectName, getSubRegionName } from '@/utils/translate';
import { CalendarIcon, BookOpenIcon, MapPinIcon, AcademicCapIcon, ComputerDesktopIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/date';
import Image from 'next/image';

const MODES: Record<string, string> = {
  'in-person': '面授',
  'online': '網課'
};

interface CaseData {
  id: string
  title?: string
  subject?: {
    label: string
  }
  region?: {
    label: string
  }
  mode?: {
    label: string
  }
  experienceLevel?: {
    label: string
  }
  budget?: string
  lessonDetails?: {
    duration: number
    pricePerLesson: number
    lessonsPerWeek: number
  }
  modes?: string[]
  createdAt: string
  avatarUrl?: string
}

interface CaseCardProps {
  caseData?: CaseData
  routeType?: 'student' | 'tutor'
  borderColor?: string
}

export default function CaseCard({ caseData, routeType = 'tutor', borderColor }: CaseCardProps) {
  const router = useRouter();

  if (!caseData) return null;

  // 根據 routeType 決定顏色主調
  const colorScheme = routeType === 'tutor' ? {
    border: 'border-blue-200',
    hover: 'hover:border-blue-300',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    button: 'bg-blue-500 hover:bg-blue-600'
  } : {
    border: 'border-blue-200',
    hover: 'hover:border-blue-300',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    button: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <div 
      className={`rounded-xl border ${borderColor || colorScheme.border} ${colorScheme.hover} p-4 transition-all cursor-pointer ${colorScheme.bg} max-sm:p-3 max-[700px]:p-4`}
      onClick={() => router.push(`/find-${routeType}-cases/${caseData.id}`)}
    >
      {/* 導師照片 */}
      {routeType === 'tutor' && caseData.avatarUrl && (
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden max-sm:h-24 max-sm:mb-2 max-[700px]:h-28 max-[700px]:mb-3">
          <Image
            src={caseData.avatarUrl}
            alt={`${caseData.title} 的照片`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 標題 */}
      <div className="space-y-1 max-sm:space-y-0.5 max-[700px]:space-y-1">
        <h3 className="text-base font-semibold line-clamp-1 max-sm:text-sm max-[700px]:text-base">
          {caseData.title || '未命名個案'}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 max-sm:gap-0.5 max-sm:text-xs max-[700px]:gap-1 max-[700px]:text-xs">
          <CalendarIcon className="h-3 w-3 max-sm:h-2 max-sm:w-2 max-[700px]:h-3 max-[700px]:w-3" />
          <span>{formatDate(caseData.createdAt)}</span>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="mt-2 space-y-1 text-sm max-sm:mt-1 max-sm:space-y-0.5 max-sm:text-xs max-[700px]:mt-2 max-[700px]:space-y-1 max-[700px]:text-sm">
        <div className="flex items-start gap-1 max-sm:gap-0.5 max-[700px]:gap-1">
          <BookOpenIcon className={`h-4 w-4 ${colorScheme.text} max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4`} />
          <span className="line-clamp-1">{caseData.subject?.label || '未指定科目'}</span>
        </div>
        <div className="flex items-start gap-1 max-sm:gap-0.5 max-[700px]:gap-1">
          <MapPinIcon className={`h-4 w-4 ${colorScheme.text} max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4`} />
          <span className="line-clamp-1">{caseData.region?.label || '未指定地區'}</span>
        </div>
        <div className="flex items-start gap-1 max-sm:gap-0.5 max-[700px]:gap-1">
          <AcademicCapIcon className={`h-4 w-4 ${colorScheme.text} max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4`} />
          <span className="line-clamp-1">{caseData.experienceLevel?.label || '未指定經驗要求'}</span>
        </div>
        {caseData.modes && (
          <div className="flex items-start gap-1 max-sm:gap-0.5 max-[700px]:gap-1">
            <ComputerDesktopIcon className={`h-4 w-4 ${colorScheme.text} max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4`} />
            <span className="line-clamp-1">{caseData.modes.join(', ')}</span>
          </div>
        )}
        {caseData.lessonDetails && (
          <div className="flex items-start gap-1 max-sm:gap-0.5 max-[700px]:gap-1">
            <CurrencyDollarIcon className={`h-4 w-4 ${colorScheme.text} max-sm:h-3 max-sm:w-3 max-[700px]:h-4 max-[700px]:w-4`} />
            <span className="line-clamp-1">每堂 ${caseData.lessonDetails.pricePerLesson}</span>
          </div>
        )}
      </div>

      {/* 查看詳情按鈕 */}
      <div className="mt-2 max-sm:mt-1 max-[700px]:mt-2">
        <button
          className={`w-full ${colorScheme.button} text-white rounded-lg py-1.5 text-xs transition-colors max-sm:py-1 max-sm:text-xs max-[700px]:py-1.5 max-[700px]:text-xs`}
        >
          查看詳情
        </button>
      </div>
    </div>
  );
} 