const axios = require('axios');

/**
 * 簡單的 SMS 測試
 */
async function testSimpleSMS() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🧪 簡單 SMS 測試...');
  console.log('📱 目標電話: 95101159');
  
  try {
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('✅ 成功！');
    console.log('📊 響應:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ 失敗:');
    console.log('狀態碼:', error.response?.status);
    console.log('錯誤:', error.response?.data);
  }
}

testSimpleSMS(); 