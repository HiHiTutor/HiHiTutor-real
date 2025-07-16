const axios = require('axios');

async function testSMSToAuth() {
  console.log('🔍 SMS.to API 診斷測試\n');
  
  // 檢查環境變數
  const clientId = process.env.SMS_TO_CLIENT_ID;
  const clientSecret = process.env.SMS_TO_CLIENT_SECRET;
  
  console.log('📋 環境變數檢查:');
  console.log(`  - SMS_TO_CLIENT_ID: ${clientId ? `${clientId.substring(0, 8)}...` : '❌ 未設置'}`);
  console.log(`  - SMS_TO_CLIENT_SECRET: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : '❌ 未設置'}`);
  
  if (!clientId || !clientSecret) {
    console.log('\n❌ 環境變數未正確設置，請檢查 .env 文件');
    return;
  }
  
  console.log('\n🔐 測試 OAuth 認證...');
  
  try {
    const authURL = 'https://auth.sms.to/oauth/token';
    const payload = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    };
    
    console.log('📤 發送認證請求到:', authURL);
    console.log('📤 請求體:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(authURL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ 認證成功!');
    console.log('📊 響應狀態:', response.status);
    console.log('📊 響應數據:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ 認證失敗!');
    console.log('📊 錯誤狀態:', error.response?.status);
    console.log('📊 錯誤訊息:', error.response?.data?.message || error.message);
    console.log('📊 完整錯誤響應:', JSON.stringify(error.response?.data, null, 2));
    
    // 分析錯誤原因
    if (error.response?.status === 422) {
      console.log('\n🔍 錯誤分析:');
      console.log('  - 422 錯誤通常表示請求參數無效');
      console.log('  - 可能原因:');
      console.log('    1. Client ID 或 Client Secret 錯誤');
      console.log('    2. SMS.to 帳戶未付費或餘額不足');
      console.log('    3. API 端點或認證方式有變更');
      console.log('    4. 帳戶被暫停或限制');
    }
  }
  
  console.log('\n🔍 建議的解決步驟:');
  console.log('  1. 檢查 SMS.to 帳戶狀態和餘額');
  console.log('  2. 重新生成 Client ID 和 Client Secret');
  console.log('  3. 查看 SMS.to 官方文檔是否有更新');
  console.log('  4. 聯繫 SMS.to 客服確認帳戶狀態');
}

// 執行測試
testSMSToAuth().catch(console.error); 