const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('🔍 測試 Admin API...');
    
    const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';
    
    // 測試1: 檢查API是否可訪問
    console.log('📡 測試1: 檢查API連接...');
    try {
      const healthCheck = await axios.get(`${baseURL}/health`);
      console.log('✅ API連接正常');
    } catch (error) {
      console.log('❌ API連接失敗:', error.message);
      return;
    }
    
    // 測試2: 檢查導師更新申請API
    console.log('📡 測試2: 檢查導師更新申請API...');
    try {
      const response = await axios.get(`${baseURL}/tutor-update-requests`);
      console.log('✅ 導師更新申請API回應:', {
        status: response.status,
        success: response.data.success,
        dataLength: response.data.data?.length || 0
      });
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('📋 找到申請:', response.data.data.map(req => ({
          id: req._id,
          name: req.name,
          pendingStatus: req.pendingProfile?.status
        })));
      } else {
        console.log('📭 沒有找到待審批的申請');
      }
    } catch (error) {
      console.log('❌ 導師更新申請API失敗:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    // 測試3: 檢查導師個人資料API
    console.log('📡 測試3: 檢查導師個人資料API...');
    try {
      const response = await axios.get(`${baseURL}/tutor-profiles/pending`);
      console.log('✅ 導師個人資料API回應:', {
        status: response.status,
        success: response.data.success,
        dataLength: response.data.data?.length || 0
      });
    } catch (error) {
      console.log('❌ 導師個人資料API失敗:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testAdminAPI(); 