'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TutorCard from './TutorCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

interface TutorSectionProps {
  tutors: any[];
}

const getCardsPerPage = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 700 ? 4 : 8;
  }
  return 8;
};

const TutorSection = ({ tutors }: TutorSectionProps) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage());
  useEffect(() => {
    const handleResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const totalPages = Math.ceil(tutors.length / cardsPerPage);
  const pagedTutors = tutors.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8 max-sm:px-4 max-sm:py-6 max-[700px]:px-6 max-[700px]:py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          className={`p-2 rounded-full border ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-200 text-yellow-600 cursor-pointer hover:bg-yellow-300'} transition`}
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          aria-label="上一頁"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👩‍🏫</span>
          <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">導師列表</h2>
        </div>
        <button
          className={`p-2 rounded-full border ${currentPage === totalPages - 1 || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-200 text-yellow-600 cursor-pointer hover:bg-yellow-300'} transition`}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          aria-label="下一頁"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
      <div className={`grid ${cardsPerPage === 4 ? 'grid-cols-2' : 'grid-cols-4'} gap-6`}>
        {pagedTutors.map((tutor: any) => (
          <TutorCard key={tutor.tutorId} tutor={tutor} />
        ))}
      </div>
    </section>
  );
};

export default TutorSection; 