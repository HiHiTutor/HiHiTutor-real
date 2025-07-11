import fetch from 'node-fetch';

// 正確 API 路徑必須有 /api 前綴
const API_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api/ads';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const mainBannerAds = [
  {
    type: 'main-banner',
    title: '尋找最適合你的導師',
    description: '我們提供專業的導師配對服務，幫助你找到最適合的學習夥伴',
    link: '/find-tutor',
    isActive: true,
    order: 1,
    bgColor: 'bg-green-800',
  },
  {
    type: 'main-banner',
    title: '🔥 最新升級導師推薦',
    description: '立即查看高評分導師，熱門時段火速約滿！',
    link: '/tutor-list',
    isActive: true,
    order: 2,
    bgColor: 'bg-yellow-700',
  },
  {
    type: 'main-banner',
    title: '🎁 成為會員即送報名禮券',
    description: '註冊帳戶即享首次報名折扣優惠，精明家長之選！',
    link: '/register',
    isActive: true,
    order: 3,
    bgColor: 'bg-blue-800',
  },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importAdWithRetry(ad, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
        },
        body: JSON.stringify(ad),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`匯入成功 [order=${ad.order}]:`, data);
        return true;
      } else {
        console.error(`匯入失敗 [order=${ad.order}] (status ${res.status}):`, data);
        if (res.status === 409 || res.status === 400) return false; // 不重試
      }
    } catch (err) {
      console.error(`匯入時發生錯誤 [order=${ad.order}] (第${attempt+1}次):`, err);
    }
    attempt++;
    if (attempt < maxRetries) {
      console.log(`等待 2 秒後重試... (第${attempt+1}次)`);
      await delay(2000);
    }
  }
  return false;
}

(async () => {
  console.log('--- 匯入 MainBanner 廣告（自動重試/間隔）---');
  for (const ad of mainBannerAds) {
    await importAdWithRetry(ad);
    await delay(2000); // 每筆間隔 2 秒
  }
  console.log('全部匯入流程結束');
})(); 