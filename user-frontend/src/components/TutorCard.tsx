'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Rating from './Rating';
import { getSubjectName } from '@/utils/translate';

interface Tutor {
  id: string;
  userId?: string;
  tutorId?: string;
  name: string;
  subject?: string;
  subjects?: string[];
  experience?: string;
  education?: string;
  tutorProfile?: {
    education?: string;
    experience?: string;
  };
  avatarUrl?: string;
  avatar?: string;
  avatarOffsetX?: number;
  rating?: number;
}

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  // 處理數據結構差異
  const displayName = tutor.name || '未指定';

  // 科目顯示邏輯 - 使用統一的翻譯函數
  const subjects = tutor.subjects || [];
  const displaySubjects = subjects.slice(0, 2).map(getSubjectName).join(' / ');
  const hasMoreSubjects = subjects.length > 2;

  const rawExperience = tutor.tutorProfile?.experience || tutor.experience;
  const displayExperience = typeof rawExperience === 'number' ? `${rawExperience}年` : rawExperience || '未指定';
  const displayEducation = tutor.education || tutor.tutorProfile?.education || '未指定';
  const displayAvatar = tutor.avatarUrl || tutor.avatar || '/avatars/default.png';
  const avatarOffsetX = tutor.avatarOffsetX || 50; // 預設置中
  
  // 使用 tutorId 作為導航 ID，如果沒有則使用 userId 或 id
  const navigationId = tutor.tutorId || tutor.userId || tutor.id;

  return (
    <Link href={`/tutors/${navigationId}`}>
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div
          className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto mb-4 bg-center bg-cover"
          style={{
            backgroundImage: `url(${displayAvatar})`,
            backgroundPositionX: `${avatarOffsetX}%`,
          }}
        />
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{displayName}</h3>
          <Rating rating={tutor.rating || 0} />
        </div>
        
        {/* 科目顯示 - 使用 badge 樣式，統一使用中文名稱 */}
        <div className="flex flex-wrap gap-1 my-2">
          {subjects.slice(0, 2).map((subject, idx) => (
            <span
              key={subject}
              className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-medium"
            >
              {getSubjectName(subject)}
            </span>
          ))}
          {subjects.length > 2 && (
            <span className="inline-block bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs font-medium">
              +{subjects.length - 2}
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          <span>教學年資: {displayExperience}</span>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard; 