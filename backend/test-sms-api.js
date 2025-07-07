const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// 測試 SMS API
const testSMSAPI = async () => {
  try {
    console.log('🧪 開始測試 SMS API...');
    
    // 測試電話號碼驗證
    console.log('\n1️⃣ 測試電話號碼驗證...');
    const validateResponse = await axios.post(`${API_BASE_URL}/validate-phone`, {
      phoneNumber: '95011159'
    });
    console.log('✅ 電話號碼驗證成功:', validateResponse.data);

    // 測試發送 SMS
    console.log('\n2️⃣ 測試發送 SMS...');
    const sendResponse = await axios.post(`${API_BASE_URL}/send-sms`, {
      phoneNumber: '+85295011159',
      purpose: 'phone_verification'
    });
    console.log('✅ SMS 發送成功:', sendResponse.data);

    // 如果有驗證碼，測試驗證
    if (sendResponse.data.success) {
      console.log('\n3️⃣ 測試驗證碼驗證...');
      console.log('請手動輸入收到的驗證碼進行測試');
      console.log('API 端點: POST /api/verify-sms');
      console.log('請求體: { "phoneNumber": "+85295011159", "code": "123456" }');
    }

  } catch (error) {
    console.error('❌ SMS API 測試失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

// 測試固定號碼 SMS
const testFixedSMS = async () => {
  try {
    console.log('🧪 測試固定號碼 SMS 發送...');
    
    const response = await axios.post(`${API_BASE_URL}/test-sms`, {});
    console.log('✅ 固定號碼 SMS 測試成功:', response.data);
  } catch (error) {
    console.error('❌ 固定號碼 SMS 測試失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

// 測試驗證碼驗證
const testVerification = async (phoneNumber, code) => {
  try {
    console.log('🧪 測試驗證碼驗證...');
    
    const response = await axios.post(`${API_BASE_URL}/verify-sms`, {
      phoneNumber,
      code
    });
    console.log('✅ 驗證碼驗證成功:', response.data);
  } catch (error) {
    console.error('❌ 驗證碼驗證失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--fixed')) {
    testFixedSMS();
  } else if (args.includes('--verify') && args.length >= 4) {
    const phoneNumber = args[2];
    const code = args[3];
    testVerification(phoneNumber, code);
  } else {
    testSMSAPI();
  }
}

module.exports = { 
  testSMSAPI, 
  testFixedSMS, 
  testVerification 
}; 