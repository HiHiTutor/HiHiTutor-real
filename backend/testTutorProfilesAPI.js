const axios = require('axios');

const API_BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

async function testTutorProfilesAPI() {
  try {
    console.log('🧪 測試導師資料API...');
    
    // 測試健康檢查
    console.log('\n1. 測試健康檢查...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康檢查:', healthResponse.data);
    
    // 測試獲取待審核導師資料（不需要認證）
    console.log('\n2. 測試獲取待審核導師資料...');
    try {
      const pendingResponse = await axios.get(`${API_BASE_URL}/tutor-profiles/pending`);
      console.log('✅ 待審核導師資料:', pendingResponse.data);
    } catch (error) {
      console.log('❌ 獲取待審核導師資料失敗:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // 測試認證中間件
    console.log('\n3. 測試認證中間件...');
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('✅ 認證測試:', authResponse.data);
    } catch (error) {
      console.log('❌ 認證測試失敗 (預期):', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testTutorProfilesAPI(); 