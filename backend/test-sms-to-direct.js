const axios = require('axios');

/**
 * 直接測試 SMS.to API
 */
async function testSMSToDirect() {
  console.log('🧪 直接測試 SMS.to API...');
  
  // 模擬 SMS.to 認證流程
  const clientId = process.env.SMS_TO_CLIENT_ID;
  const clientSecret = process.env.SMS_TO_CLIENT_SECRET;
  
  console.log('🔐 檢查環境變數:');
  console.log('- SMS_TO_CLIENT_ID:', clientId ? '已設置' : '未設置');
  console.log('- SMS_TO_CLIENT_SECRET:', clientSecret ? '已設置' : '未設置');
  
  if (!clientId || !clientSecret) {
    console.log('❌ 環境變數未設置，無法測試');
    return;
  }
  
  try {
    console.log('\n🔐 測試 SMS.to 認證...');
    console.log('URL: https://auth.sms.to/oauth/token');
    
    const authResponse = await axios.post('https://auth.sms.to/oauth/token', {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ 認證成功！');
    console.log('📊 響應狀態:', authResponse.status);
    console.log('📊 響應數據:', JSON.stringify(authResponse.data, null, 2));
    
    const accessToken = authResponse.data.access_token;
    if (accessToken) {
      console.log('\n📱 測試 SMS 發送...');
      console.log('URL: https://api.sms.to/sms/send');
      
      const smsResponse = await axios.post('https://api.sms.to/sms/send', {
        to: '+85295101159',
        message: 'Test SMS from HiHiTutor - Your verification code is 123456. Valid for 10 minutes.',
        from: 'HiHiTutor'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 15000
      });
      
      console.log('✅ SMS 發送成功！');
      console.log('📊 響應狀態:', smsResponse.status);
      console.log('📊 響應數據:', JSON.stringify(smsResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ SMS.to API 測試失敗:');
    console.error('📊 狀態碼:', error.response?.status || 'N/A');
    console.error('📊 錯誤信息:', error.message);
    
    if (error.response?.data) {
      console.error('📊 錯誤響應:', JSON.stringify(error.response.data, null, 2));
    }
    
    // 分析錯誤
    if (error.response?.status === 401) {
      console.log('\n💡 認證失敗 - 檢查 Client ID 和 Secret');
    } else if (error.response?.status === 404) {
      console.log('\n💡 API 端點不存在 - 檢查 URL');
    } else if (error.response?.status === 400) {
      console.log('\n💡 請求格式錯誤 - 檢查 payload');
    }
  }
}

// 執行測試
testSMSToDirect(); 