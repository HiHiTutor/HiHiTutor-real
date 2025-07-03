'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('tutor'); // 'tutor' or 'student'
  const router = useRouter();

  const handleSearch = (e: any) => {
    e.preventDefault();
    console.log('👉 handleSearch triggered, searchType =', searchType, 'searchQuery =', searchQuery);
    if (searchQuery.trim()) {
      if (searchType === 'tutor') {
        router.push(`/find-student-cases?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchType === 'student') {
        router.push(`/find-tutor-cases?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-yellow-300 p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="searchType"
                  value="tutor"
                  checked={searchType === 'tutor'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-yellow-400"
                />
                <span className="text-sm font-medium">尋導師</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="searchType"
                  value="student"
                  checked={searchType === 'student'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-yellow-400"
                />
                <span className="text-sm font-medium">招學生</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入科目、導師或課程關鍵字"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
            <button 
              type="submit"
              className="bg-yellow-400 text-white px-8 py-2 rounded-lg hover:bg-yellow-500 transition-all duration-200 font-semibold"
            >
              搜尋
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchBar; 