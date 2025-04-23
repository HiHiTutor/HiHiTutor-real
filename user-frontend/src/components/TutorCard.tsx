'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  experience: string;
  avatar: string;
  rating?: number;
}

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/tutors/${tutor.id}`);
  };

  return (
    <div 
      className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-48 w-full mb-4">
        <Image
          src={tutor.avatar || '/avatars/default.png'}
          alt={tutor.name}
          fill
          className="object-cover rounded-lg"
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
  );
};

export default TutorCard; 