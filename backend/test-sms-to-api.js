const axios = require('axios');

// 檢查 SMS.to API 憑證
console.log('🔍 檢查 SMS.to API 憑證...');
console.log('SMS_TO_CLIENT_ID:', process.env.SMS_TO_CLIENT_ID ? '✅ 已設置' : '❌ 未設置');
console.log('SMS_TO_CLIENT_SECRET:', process.env.SMS_TO_CLIENT_SECRET ? '✅ 已設置' : '❌ 未設置');

if (!process.env.SMS_TO_CLIENT_ID || !process.env.SMS_TO_CLIENT_SECRET) {
  console.log('\n❌ 缺少 SMS.to API 憑證！');
  console.log('請設置以下環境變數：');
  console.log('- SMS_TO_CLIENT_ID');
  console.log('- SMS_TO_CLIENT_SECRET');
  console.log('\n你可以：');
  console.log('1. 創建 backend/.env 文件並添加這些變數');
  console.log('2. 或者在運行前設置環境變數');
  process.exit(1);
}

/**
 * 測試 Vercel 部署的 SMS.to 驗證碼發送 API
 */
async function testSMSToAPI() {
  try {
    console.log('\n🧪 開始測試 Vercel 部署的 SMS.to 驗證碼發送...');
    console.log('📱 電話號碼: 95011159');
    console.log('🌐 API 端點: https://hi-hi-tutor-real-backend2.vercel.app/api/auth/request-verification-code');
    
    const response = await axios.post('https://hi-hi-tutor-real-backend2.vercel.app/api/auth/request-verification-code', {
      phone: '95011159'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('\n✅ 驗證碼發送成功！');
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n📨 實際發送的訊息內容:');
      console.log('Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      console.log('📱 驗證碼已發送到: +85295011159');
      console.log('🔑 臨時令牌:', response.data.token);
      
      if (response.data.code) {
        console.log('🔢 驗證碼 (開發環境):', response.data.code);
      }
    }
    
  } catch (error) {
    console.error('\n❌ 驗證碼發送失敗:');
    if (error.response) {
      console.error('狀態碼:', error.response.status);
      console.error('錯誤信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('錯誤:', error.message);
    }
  }
}

// 執行測試
testSMSToAPI(); 