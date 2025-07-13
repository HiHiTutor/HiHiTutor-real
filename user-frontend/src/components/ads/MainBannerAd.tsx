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
  buttonColor?: string; // 新增
}

const API_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

export default function MainBannerAd() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/ads?type=main-banner`)
      .then(res => res.json())
      .then(data => {
        const ads = Array.isArray(data) ? data : [];
        // 只顯示啟用的廣告
        const activeAds = ads.filter(ad => ad.isActive !== false);
        setAds(activeAds);
      });
  }, []);

  useEffect(() => {
    console.log('main-banner ads:', ads);
  }, [ads]);

  if (!ads.length) return <div style={{color: 'red', textAlign: 'center'}}>（main-banner 無資料）</div>;
  const current = ads[index];

  return (
    <div
      className="relative text-white py-10 px-6 h-[400px] flex items-center transition-all duration-500"
      style={{
        backgroundColor: current.bgColor || '#b45309',
        backgroundImage: current.imageUrl ? `url(${current.imageUrl})` : undefined,
        backgroundSize: current.imageUrl ? 'cover' : undefined,
        backgroundPosition: current.imageUrl ? 'center' : undefined,
        backgroundRepeat: current.imageUrl ? 'no-repeat' : undefined
      }}
    >
      <div>
        <h2 className="text-3xl font-bold mb-3">{current.title}</h2>
        <p className="mb-4">{current.description}</p>
        {current.link && (
          <a
            href={current.link}
            style={{ backgroundColor: current.buttonColor || '#facc15', color: '#000' }}
            className="px-4 py-2 rounded hover:opacity-90"
          >
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