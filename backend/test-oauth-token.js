const axios = require('axios');
require('dotenv').config();

async function testOAuthToken() {
  console.log('🔍 測試 SMS.to OAuth Token 請求...');
  
  // 檢查環境變數
  const clientId = process.env.SMS_TO_CLIENT_ID;
  const clientSecret = process.env.SMS_TO_CLIENT_SECRET;
  
  console.log('📋 環境變數檢查:');
  console.log('  - SMS_TO_CLIENT_ID:', clientId ? `${clientId.substring(0, 8)}...` : '未設置');
  console.log('  - SMS_TO_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 8)}...` : '未設置');
  
  if (!clientId || !clientSecret) {
    console.error('❌ 環境變數未設置');
    return;
  }
  
  try {
    // 準備請求 payload
    const payload = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    };
    
    console.log('📤 發送請求到: https://auth.sms.to/oauth/token');
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post('https://auth.sms.to/oauth/token', payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ OAuth Token 請求成功!');
    console.log('📊 響應狀態:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ OAuth Token 請求失敗:');
    console.error('  - 錯誤訊息:', error.message);
    console.error('  - 狀態碼:', error.response?.status);
    console.error('  - 響應數據:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 422) {
      console.error('🔍 422 錯誤分析:');
      console.error('  - 這表示請求格式錯誤或欄位名稱不正確');
      console.error('  - 請檢查 client_id 和 client_secret 欄位名稱');
    }
  }
}

testOAuthToken(); 