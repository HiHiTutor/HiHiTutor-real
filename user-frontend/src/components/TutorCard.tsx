'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Rating from './Rating';
import { getSubjectName } from '@/utils/translate';
import { Tutor } from '@/types/tutor';
import { calculateAge, formatAge } from '@/utils/ageUtils';

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  // 處理數據結構差異
  const displayName = tutor.tutorId || '未指定';

  // 科目顯示邏輯 - 使用統一的翻譯函數
  const subjects = tutor.subjects || [];
  const displaySubjects = subjects.slice(0, 2).map(getSubjectName).join(' / ');
  const hasMoreSubjects = subjects.length > 2;

  const rawExperience = tutor.tutorProfile?.experience || tutor.experience;
  const displayExperience = typeof rawExperience === 'number' ? `${rawExperience}年` : rawExperience || '0年';
  const displayEducation = tutor.education || tutor.tutorProfile?.education || '未指定';
  
  // 頭像處理邏輯 - 優先使用用戶上傳的頭像，否則使用預設頭像
  const userAvatar = tutor.avatarUrl || tutor.avatar;
  const defaultAvatar = '/avatars/default.png';
  const displayAvatar = userAvatar || defaultAvatar;
  const avatarOffsetX = tutor.avatarOffsetX || 50; // 預設置中
  
  // 頭像加載錯誤處理
  const handleAvatarError = (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
    const target = e.currentTarget as HTMLDivElement;
    if (target.style.backgroundImage !== `url(${defaultAvatar})`) {
      target.style.backgroundImage = `url(${defaultAvatar})`;
    }
  };
  
  // 獲取性別信息 - 處理兩種數據結構
  const gender = tutor.tutorProfile?.gender || tutor.gender;
  
  // 計算年齡 - 從多個位置獲取出生日期
  const birthDate = tutor.tutorProfile?.birthDate || tutor.birthDate;
  const age = calculateAge(birthDate);
  
  // 使用 tutorId 作為導航 ID，如果沒有則使用 userId 或 id
  const navigationId = tutor.tutorId || tutor.id;

  if (!navigationId) {
    return (
      <div className="bg-gray-100 border border-gray-200 p-4 rounded-xl shadow-sm opacity-50 pointer-events-none text-center max-sm:p-3">
        <div className="mb-2 max-sm:text-sm">資料有誤，缺少 tutorId 或 id</div>
        <div className="text-xs text-gray-400 max-sm:text-xs">請聯絡管理員修正</div>
      </div>
    );
  }

  return (
    <Link href={`/tutors/${navigationId}`}>
      <div className="bg-white border border-yellow-200 p-4 rounded-2xl shadow-md hover:shadow-lg hover:border-yellow-300 transition-all duration-200 cursor-pointer max-sm:p-3 max-[700px]:p-4 bg-gradient-to-br from-white to-yellow-50">
        <div className="relative mx-auto mb-4 max-sm:mb-3 max-[700px]:mb-3">
          <div
            className={`w-[100px] h-[100px] rounded-full overflow-hidden mx-auto max-sm:w-[80px] max-sm:h-[80px] max-[700px]:w-[90px] max-[700px]:h-[90px] border-4 ${
              gender === 'male' 
                ? 'border-blue-400' 
                : gender === 'female' 
                ? 'border-pink-400' 
                : 'border-yellow-100'
            }`}
          >
            <img
              src={displayAvatar}
              alt={`${displayName} 頭像`}
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${avatarOffsetX}% center`,
              }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== defaultAvatar) {
                  target.src = defaultAvatar;
                }
              }}
            />
          </div>
          {/* 調試信息 - 開發環境顯示 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
              Gender: {gender || 'null'}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center max-sm:flex-col max-sm:items-center max-sm:gap-1 max-[700px]:flex-col max-[700px]:items-center max-[700px]:gap-1">
          <h3 className="text-lg font-semibold text-yellow-900 max-sm:text-base max-sm:text-center max-[700px]:text-base max-[700px]:text-center">
            {displayName}
          </h3>
          <Rating rating={tutor.rating || 0} />
        </div>
        
        {/* 科目顯示 - 使用 badge 樣式，統一使用中文名稱 */}
        <div className="flex flex-wrap gap-1 my-2 max-sm:gap-0.5 max-sm:my-1 max-sm:justify-center max-[700px]:gap-1 max-[700px]:my-2 max-[700px]:justify-center">
          {subjects.slice(0, 2).map((subject, idx) => (
            <span
              key={subject}
              className="inline-block bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 text-xs font-medium max-sm:px-1 max-sm:py-0.5 max-sm:text-xs max-[700px]:px-2 max-[700px]:py-0.5 max-[700px]:text-xs"
            >
              {getSubjectName(subject)}
            </span>
          ))}
          {subjects.length > 2 && (
            <span className="inline-block bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs font-medium max-sm:px-1 max-sm:py-0.5 max-sm:text-xs max-[700px]:px-2 max-[700px]:py-0.5 max-[700px]:text-xs">
              +{subjects.length - 2}
            </span>
          )}
        </div>
        
        <div className="text-sm text-yellow-700 max-sm:text-xs max-sm:text-center max-[700px]:text-sm max-[700px]:text-center space-y-1">
          <div className="flex justify-between items-center">
            <span>年齡: {formatAge(age)}</span>
            <span>教學年資: {displayExperience}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard; 