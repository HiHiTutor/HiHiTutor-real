import React, { useEffect, useState } from 'react';

interface Ad {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
}

const ads: Ad[] = [
  {
    title: '尋找最適合你的導師',
    description: '我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴',
    buttonText: '了解更多',
    buttonLink: '/find-tutor',
    bgColor: 'bg-green-800',
  },
  {
    title: '🔥 最新升級導師推薦',
    description: '立即查看高評分導師，熱門時段火速約滿！',
    buttonText: '立即查看',
    buttonLink: '/tutor-list',
    bgColor: 'bg-yellow-700',
  },
  {
    title: '🎁 成為會員即送報名禮券',
    description: '註冊帳戶即享首次報名折扣優惠，精明家長之選！',
    buttonText: '註冊會員',
    buttonLink: '/register',
    bgColor: 'bg-blue-800',
  },
];

export default function HeroAdCarousel() {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev: number) => (prev + 1) % ads.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const current = ads[index];

  return (
    <div className={`relative text-white py-10 px-6 h-[400px] flex items-center ${current.bgColor} transition-all duration-500`}>
      <div>
        <h2 className="text-3xl font-bold mb-3">{current.title}</h2>
        <p className="mb-4">{current.description}</p>
        <a href={current.buttonLink} className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500">
          {current.buttonText}
        </a>
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