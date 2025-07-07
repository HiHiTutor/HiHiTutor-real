const axios = require('axios');

/**
 * 測試之前工作的 auth 端點
 */
async function testAuthEndpoint() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🧪 測試之前工作的 auth 端點...');
  console.log('🌐 基礎 URL:', baseURL);
  
  // 測試 request-verification-code 端點
  try {
    console.log('\n📱 測試 POST /api/auth/request-verification-code...');
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('✅ 請求成功:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n📨 實際發送的訊息內容:');
      console.log('Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      console.log('📱 驗證碼已發送到: +85295101159');
      console.log('🔑 臨時令牌:', response.data.token);
      
      if (response.data.code) {
        console.log('🔢 驗證碼 (開發環境):', response.data.code);
      }
    }
    
  } catch (error) {
    console.log('❌ 請求失敗:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('錯誤詳情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 執行測試
testAuthEndpoint(); 