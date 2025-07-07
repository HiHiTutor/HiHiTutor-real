const axios = require('axios');

/**
 * 檢查 Vercel 上的詳細 SMS 錯誤
 */
async function testVercelSMSError() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🔍 檢查 Vercel 上的詳細 SMS 錯誤...');
  console.log('🌐 基礎 URL:', baseURL);
  
  try {
    console.log('\n📱 發送驗證碼請求...');
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500; // 接受所有狀態碼
      }
    });
    
    console.log('📊 響應狀態:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('\n✅ SMS 發送成功！');
      console.log('📱 驗證碼已發送到: +85295101159');
      console.log('🔑 臨時令牌:', response.data.token);
      console.log('📨 訊息內容: Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      
      if (response.data.code) {
        console.log('🔢 驗證碼 (開發環境):', response.data.code);
      }
    } else {
      console.log('\n❌ SMS 發送失敗');
      console.log('📊 錯誤詳情:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ 請求失敗:');
    console.error('📊 狀態碼:', error.response?.status || 'N/A');
    console.error('📊 錯誤信息:', error.message);
    
    if (error.response?.data) {
      console.error('📊 錯誤響應:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.headers) {
      console.error('📊 響應標頭:', JSON.stringify(error.response.headers, null, 2));
    }
  }
  
  // 測試 2: 檢查是否有其他 SMS 端點
  try {
    console.log('\n🔍 檢查其他 SMS 端點...');
    const smsEndpoints = [
      '/api/sms/send-sms',
      '/api/sms/test-sms',
      '/api/send-sms'
    ];
    
    for (const endpoint of smsEndpoints) {
      try {
        const testResponse = await axios.get(`${baseURL}${endpoint}`, { timeout: 5000 });
        console.log(`✅ ${endpoint} 存在:`, testResponse.status);
      } catch (err) {
        console.log(`❌ ${endpoint} 不存在:`, err.response?.status || 'N/A');
      }
    }
  } catch (error) {
    console.log('❌ 端點檢查失敗:', error.message);
  }
}

// 執行測試
testVercelSMSError(); 