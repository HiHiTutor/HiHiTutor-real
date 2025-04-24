'use client';

import { useEffect, useState } from 'react';
import TutorCard from '@/components/TutorCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  education: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  isVip: boolean;
  isTop: boolean;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('/api/tutors');
        const data = await response.json();
        console.log("📦 所有導師", data);
        setTutors(data);
        setFilteredTutors(data);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTutors(tutors);
    } else {
      const filtered = tutors.filter(
        tutor =>
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTutors(filtered);
    }
  }, [searchQuery, tutors]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">尋找導師</h1>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="搜尋導師姓名或科目..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
} 