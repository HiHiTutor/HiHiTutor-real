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

// Rating component to display stars
const Rating = ({ rating }: { rating: number }) => {
  if (!rating || rating <= 0) {
    return null; // Don't show anything for 0 or no rating
  }

  const stars = [];
  // Round to nearest 0.5 for half-star logic if needed in future
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`star-${i}`} className="text-yellow-400">⭐</span>);
  }
  
  // Example for half star if you want it later
  // if (roundedRating - fullStars === 0.5) {
  //   stars.push(<span key="half-star">🌟</span>);
  // }

  return <div className="flex items-center">{stars}</div>;
};

const TutorCard = ({ tutor }: TutorCardProps) => {
  // 處理數據結構差異
  const displayName = tutor.name || '未指定';

  // 科目顯示邏輯
  const subjects = tutor.subjects || [];
  const displaySubjects = subjects.slice(0, 2).join(' / ');
  const hasMoreSubjects = subjects.length > 2;

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
          <Rating rating={tutor.rating || 0} />
        </div>
        <p className="text-gray-600">
          {displaySubjects}
          {hasMoreSubjects && <span className="ml-1">+</span>}
        </p>
        <div className="text-sm text-gray-500">
          <span>教學年資: {displayExperience}</span>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard; 