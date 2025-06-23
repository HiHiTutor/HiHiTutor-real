'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  experience: string;
  avatarUrl: string;
  rating?: number;
}

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  return (
    <Link href={`/tutors/${tutor.id}`}>
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div 
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 1rem auto'
          }}
        >
          <Image
            src={tutor.avatarUrl || '/default.jpg'}
            alt={`${tutor.name} 的照片`}
            width={100}
            height={100}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            unoptimized
          />
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{tutor.name}</h3>
          {tutor.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">⭐</span>
              <span className="ml-1 text-sm">{tutor.rating}</span>
            </div>
          )}
        </div>
        <p className="text-gray-600">{tutor.subject}</p>
        <div className="text-sm text-gray-500">
          <span>教學年資: {tutor.experience}</span>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard; 