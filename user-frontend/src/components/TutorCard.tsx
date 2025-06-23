'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Tutor {
  id: string;
  userId?: string;
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
  const displaySubject = tutor.subject || tutor.subjects?.[0] || '未指定';
  const rawExperience = tutor.tutorProfile?.experience || tutor.experience;
  const displayExperience = typeof rawExperience === 'number' ? `${rawExperience}年` : rawExperience || '未指定';
  const displayEducation = tutor.education || tutor.tutorProfile?.education || '未指定';
  const displayAvatar = tutor.avatarUrl || tutor.avatar || '/avatars/default.png';
  const avatarOffsetX = tutor.avatarOffsetX || 50; // 預設置中
  
  // 使用 userId 作為導航 ID，如果沒有則使用 id
  const navigationId = tutor.userId || tutor.id;

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
          {tutor.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">⭐</span>
              <span className="ml-1 text-sm">{tutor.rating}</span>
            </div>
          )}
        </div>
        <p className="text-gray-600">{displaySubject}</p>
        <div className="text-sm text-gray-500">
          <span>教學年資: {displayExperience}</span>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard; 