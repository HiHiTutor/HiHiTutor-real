'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-yellow-300 p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
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
        </form>
      </div>
    </section>
  );
};

export default SearchBar; 