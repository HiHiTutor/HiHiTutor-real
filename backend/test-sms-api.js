const axios = require('axios');

// 測試 SMS API
const testSMSAPI = async () => {
  try {
    console.log('🧪 開始測試 SMS API...');
    
    const response = await axios.post('http://localhost:3001/api/send-sms', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SMS API 測試成功:', response.data);
  } catch (error) {
    console.error('❌ SMS API 測試失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  testSMSAPI();
}

module.exports = { testSMSAPI }; 