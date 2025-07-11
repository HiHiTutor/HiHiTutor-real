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
  buttonText?: string;
  buttonColor?: string;
}

const API_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

export default function HeroAd() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/ads?type=hero`)
      .then(res => res.json())
      .then(data => {
        const ads = Array.isArray(data) ? data : [];
        // 只顯示啟用的廣告
        const activeAds = ads.filter(ad => ad.isActive !== false);
        setAds(activeAds);
      });
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
    <div
      className={`relative text-white py-10 px-6 h-[400px] flex items-center transition-all duration-500`}
      style={{
        overflow: 'hidden',
        background: current.imageUrl ? undefined : (current.bgColor || '#2563eb'),
      }}
    >
      {/* 背景圖片 */}
      {current.imageUrl && (
        <img
          src={current.imageUrl}
          alt={current.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}
      <div style={{position: 'relative', zIndex: 1}}>
        <h2 className="text-3xl font-bold mb-3">{current.title}</h2>
        <p className="mb-4">{current.description}</p>
        {current.link && (
          <a
            href={current.link}
            style={{
              background: current.buttonColor || '#2563eb',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 6,
              fontWeight: 'bold',
              display: 'inline-block',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            className="hover:opacity-90"
          >
            {current.buttonText || '了解更多'}
          </a>
        )}
      </div>
      {/* 指示點 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2" style={{zIndex: 2}}>
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