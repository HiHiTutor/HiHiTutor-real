const axios = require('axios');

const API_BASE = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

async function testTutorUpdateRequests() {
  try {
    console.log('🔍 測試 tutor-update-requests API...');
    
    // 測試 GET /api/tutor-update-requests
    console.log('\n📥 測試獲取待審批申請...');
    const response = await axios.get(`${API_BASE}/tutor-update-requests`);
    
    console.log('✅ 回應狀態:', response.status);
    console.log('✅ 回應資料:', response.data);
    
    if (response.data.success) {
      console.log(`📋 找到 ${response.data.data?.length || 0} 個待審批申請`);
      
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((request, index) => {
          console.log(`\n${index + 1}. 申請者: ${request.name}`);
          console.log(`   狀態: ${request.pendingProfile?.status}`);
          console.log(`   提交時間: ${request.pendingProfile?.submittedAt}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
    console.error('❌ 狀態碼:', error.response?.status);
  }
}

testTutorUpdateRequests(); 