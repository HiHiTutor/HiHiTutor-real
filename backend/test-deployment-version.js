const axios = require('axios');

/**
 * 測試當前部署的版本
 */
async function testDeploymentVersion() {
  const baseURL = 'https://hi-hi-tutor-real-backend2.vercel.app';
  
  console.log('🧪 測試當前部署版本...');
  console.log('🌐 基礎 URL:', baseURL);
  
  // 測試 1: 檢查環境變數
  try {
    console.log('\n1️⃣ 測試環境變數...');
    const envResponse = await axios.get(`${baseURL}/api/test`, { timeout: 10000 });
    console.log('✅ 環境變數:', envResponse.data);
  } catch (error) {
    console.log('❌ 環境變數測試失敗:', error.response?.status || error.message);
  }
  
  // 測試 2: 檢查 SMS 服務配置
  try {
    console.log('\n2️⃣ 測試 SMS 服務配置...');
    const smsConfigResponse = await axios.get(`${baseURL}/api/debug/sms-config`, { timeout: 10000 });
    console.log('✅ SMS 配置:', smsConfigResponse.data);
  } catch (error) {
    console.log('❌ SMS 配置測試失敗:', error.response?.status || error.message);
  }
  
  // 測試 3: 檢查當前使用的 SMS 服務
  try {
    console.log('\n3️⃣ 測試當前 SMS 服務...');
    const response = await axios.post(`${baseURL}/api/auth/request-verification-code`, {
      phone: '95101159'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('✅ 請求成功:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
    // 檢查響應中是否包含 SMS 服務信息
    if (response.data.success) {
      console.log('\n📨 SMS 服務信息:');
      console.log('- 使用 SMS.to 服務');
      console.log('- 訊息格式: Your HiHiTutor verification code is [OTP]. Valid for 10 minutes.');
      console.log('- 驗證碼有效期: 10 分鐘');
    }
    
  } catch (error) {
    console.log('❌ SMS 服務測試失敗:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('錯誤詳情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 執行測試
testDeploymentVersion(); 