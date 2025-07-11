const fetch = require('node-fetch');

const API_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api/ads';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const heroAds = [
  {
    type: 'hero',
    title: '尋找最適合你的導師',
    description: '我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴',
    link: '/find-tutor',
    isActive: true,
    order: 1,
    bgColor: 'bg-green-800',
  },
  {
    type: 'hero',
    title: '🔥 最新升級導師推薦',
    description: '立即查看高評分導師，熱門時段火速約滿！',
    link: '/tutor-list',
    isActive: true,
    order: 2,
    bgColor: 'bg-yellow-700',
  },
  {
    type: 'hero',
    title: '🎁 成為會員即送報名禮券',
    description: '註冊帳戶即享首次報名折扣優惠，精明家長之選！',
    link: '/register',
    isActive: true,
    order: 3,
    bgColor: 'bg-blue-800',
  },
];

const mainBannerAds = heroAds.map((ad, i) => ({
  ...ad,
  type: 'main-banner',
  order: i + 1,
}));

async function importAds(ads) {
  for (const ad of ads) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
      },
      body: JSON.stringify(ad),
    });
    const data = await res.json();
    console.log('匯入結果:', data);
  }
}

(async () => {
  console.log('--- 匯入 Hero 廣告 ---');
  await importAds(heroAds);
  console.log('--- 匯入 MainBanner 廣告 ---');
  await importAds(mainBannerAds);
  console.log('全部匯入完成');
})(); 