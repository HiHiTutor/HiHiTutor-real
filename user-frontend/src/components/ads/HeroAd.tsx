import React, { useEffect, useState } from 'react';

interface Ad {
  _id: string;
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  isActive: boolean;
  order?: number;
  bgColor?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

export default function HeroAd() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/ads?type=hero`)
      .then(res => res.json())
      .then(data => setAds(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setIndex(prev => (prev + 1) % ads.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [ads]);

  if (!ads.length) return null;
  const current = ads[index];

  return (
    <div className={`relative text-white py-10 px-6 h-[400px] flex items-center ${current.bgColor || 'bg-green-800'} transition-all duration-500`}>
      <div>
        <h2 className="text-3xl font-bold mb-3">{current.title}</h2>
        <p className="mb-4">{current.description}</p>
        {current.link && (
          <a href={current.link} className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500">
            了解更多
          </a>
        )}
      </div>
      {/* 指示點 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2">
        {ads.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? 'bg-white' : 'bg-gray-400'}`}
            style={{ opacity: i === index ? 1 : 0.5 }}
            onClick={() => setIndex(i)}
            aria-label={`切換到第${i + 1}個廣告`}
            type="button"
          />
        ))}
        {ads.length === 1 && (
          <span className="w-3 h-3 rounded-full bg-gray-400 opacity-50" />
        )}
      </div>
    </div>
  );
} 