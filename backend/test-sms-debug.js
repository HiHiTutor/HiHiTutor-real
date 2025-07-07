const axios = require('axios');

/**
 * 詳細調試 SMS 配置
 */
async function testSMSDebug() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🔍 詳細調試 SMS 配置...');
  console.log('🌐 基礎 URL:', baseURL);
  
  // 測試 1: 檢查環境變數
  try {
    console.log('\n1️⃣ 檢查環境變數...');
    const envResponse = await axios.get(`${baseURL}/api/test`, { timeout: 10000 });
    console.log('✅ 環境變數檢查:', envResponse.data);
  } catch (error) {
    console.log('❌ 環境變數檢查失敗:', error.response?.status || error.message);
  }
  
  // 測試 2: 檢查 SMS 服務配置
  try {
    console.log('\n2️⃣ 檢查 SMS 服務配置...');
    const smsConfigResponse = await axios.get(`${baseURL}/api/debug/sms-config`, { timeout: 10000 });
    console.log('✅ SMS 配置:', smsConfigResponse.data);
  } catch (error) {
    console.log('❌ SMS 配置檢查失敗:', error.response?.status || error.message);
  }
  
  // 測試 3: 發送測試 SMS
  try {
    console.log('\n3️⃣ 發送測試 SMS...');
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('✅ SMS 發送成功！');
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n📨 SMS 發送詳情:');
      console.log('- 目標電話: +85295101159');
      console.log('- 訊息格式: Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      console.log('- 驗證碼有效期: 10 分鐘');
      console.log('- 臨時令牌:', response.data.token);
      
      if (response.data.code) {
        console.log('- 驗證碼 (開發環境):', response.data.code);
      }
    }
    
  } catch (error) {
    console.error('\n❌ SMS 發送失敗:');
    console.error('📊 狀態碼:', error.response?.status || 'N/A');
    
    if (error.response?.data) {
      console.error('📊 錯誤響應:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ 錯誤信息:', error.message);
    }
    
    // 詳細錯誤分析
    console.log('\n🔍 錯誤分析:');
    if (error.response?.status === 500) {
      console.log('- 伺服器內部錯誤');
      console.log('- 可能是 SMS.to API 配置問題');
      console.log('- 或環境變數未正確設置');
    } else if (error.response?.status === 404) {
      console.log('- API 端點不存在');
    } else if (error.response?.status === 401) {
      console.log('- 認證失敗');
      console.log('- 可能是 SMS.to 憑證問題');
    }
  }
  
  // 測試 4: 檢查部署時間
  try {
    console.log('\n4️⃣ 檢查部署時間...');
    const deployResponse = await axios.get(`${baseURL}/api/test`, { timeout: 10000 });
    console.log('✅ 部署檢查:', deployResponse.data);
  } catch (error) {
    console.log('❌ 部署檢查失敗:', error.response?.status || error.message);
  }
}

// 執行測試
testSMSDebug(); 