const axios = require('axios');

/**
 * 測試修正後的 SMS.to API
 */
async function testSMSToFixed() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🧪 測試修正後的 SMS.to API...');
  console.log('🌐 基礎 URL:', baseURL);
  console.log('📱 目標電話號碼: +85295101159');
  
  try {
    console.log('\n📱 發送驗證碼請求...');
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('\n✅ 請求成功！');
    console.log('📊 狀態碼:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n📨 SMS 發送成功！');
      console.log('📱 驗證碼已發送到: +85295101159');
      console.log('🔑 臨時令牌:', response.data.token);
      console.log('📨 訊息內容: Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      
      if (response.data.code) {
        console.log('🔢 驗證碼 (開發環境):', response.data.code);
      }
    }
    
  } catch (error) {
    console.error('\n❌ 請求失敗:');
    console.error('📊 狀態碼:', error.response?.status || 'N/A');
    
    if (error.response?.data) {
      console.error('📊 錯誤響應:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 錯誤信息:', error.message);
    }
    
    // 分析錯誤原因
    if (error.response?.status === 500) {
      console.log('\n💡 可能的問題：');
      console.log('- SMS_TO_CLIENT_ID 未正確設置');
      console.log('- SMS_TO_CLIENT_SECRET 未正確設置');
      console.log('- SMS.to API 端點可能有問題');
    }
  }
}

// 執行測試
testSMSToFixed(); 