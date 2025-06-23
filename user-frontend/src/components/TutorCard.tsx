'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Tutor {
  id: string;
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
  rating?: number;
}

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  // 處理數據結構差異
  const displayName = tutor.name || '未指定';
  const displaySubject = tutor.subject || tutor.subjects?.[0] || '未指定';
  const displayExperience = tutor.experience || tutor.tutorProfile?.experience || '未指定';
  const displayEducation = tutor.education || tutor.tutorProfile?.education || '未指定';
  const displayAvatar = tutor.avatarUrl || tutor.avatar || '/avatars/default.png';

  return (
    <Link href={`/tutors/${tutor.id}`}>
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto mb-4">
          <Image
            src={displayAvatar}
            alt={`${displayName} 的照片`}
            width={100}
            height={100}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
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