const axios = require('axios');

const API_BASE = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function testFeaturedTutorsAPI() {
  try {
    console.log('🧪 測試 featured 導師 API...');
    
    const url = `${API_BASE}/api/tutors?featured=true&limit=8`;
    console.log('🔗 請求 URL:', url);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ API 回應狀態:', response.status);
    console.log('📦 回應資料:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.tutors) {
      const tutors = response.data.data.tutors;
      console.log(`🎯 找到 ${tutors.length} 個 featured 導師`);
      
      tutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop})`);
      });
      
      if (tutors.length === 0) {
        console.log('⚠️ 沒有找到 featured 導師，可能的原因：');
        console.log('- 資料庫中沒有 isVip=true 或 isTop=true 的導師');
        console.log('- 查詢條件有問題');
        console.log('- MongoDB 連接問題');
      }
    } else {
      console.log('❌ API 回應格式不正確');
    }
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error.message);
    
    if (error.response) {
      console.error('📊 錯誤狀態:', error.response.status);
      console.error('📦 錯誤資料:', error.response.data);
    }
  }
}

// 執行測試
testFeaturedTutorsAPI(); 