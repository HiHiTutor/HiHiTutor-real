const axios = require('axios');

// 測試配置
const API_URL = 'http://localhost:3001/api/auth/request-verification-code';
const TEST_PHONE = '+85260761408'; // 測試用的香港電話號碼

/**
 * 測試驗證碼發送 API
 */
async function testRequestVerificationCode() {
  console.log('🚀 測試 /api/auth/request-verification-code API...\n');

  try {
    console.log('📱 發送驗證碼到:', TEST_PHONE);
    console.log('🌐 API URL:', API_URL);
    
    const response = await axios.post(API_URL, {
      phone: TEST_PHONE
    });

    console.log('✅ 驗證碼發送成功!');
    console.log('📊 回應:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ 驗證碼發送失敗:');
    if (error.response) {
      console.error('狀態碼:', error.response.status);
      console.error('錯誤訊息:', error.response.data);
    } else {
      console.error('網路錯誤:', error.message);
    }
    throw error;
  }
}

/**
 * 測試不同電話格式
 */
async function testDifferentPhoneFormats() {
  console.log('\n📞 測試不同電話格式...\n');

  const testCases = [
    { phone: '61234567', description: '8位數字' },
    { phone: '+85261234567', description: '完整國際格式' },
    { phone: '85261234567', description: '無+號國際格式' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📱 測試 ${testCase.description}: ${testCase.phone}`);
      
      const response = await axios.post(API_URL, {
        phone: testCase.phone
      });

      console.log(`✅ ${testCase.description} 成功!`);
      console.log(`📊 回應:`, JSON.stringify(response.data, null, 2));
      
      // 等待 2 秒再測試下一個
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ ${testCase.description} 失敗:`, error.response?.data || error.message);
    }
  }
}

/**
 * 主測試函數
 */
async function runTests() {
  console.log('🧪 開始測試 Bird SMS 驗證 API...\n');

  try {
    // 測試 1: 基本驗證碼發送
    await testRequestVerificationCode();
    
    // 測試 2: 不同電話格式
    await testDifferentPhoneFormats();

    console.log('\n🎉 所有測試完成！');
  } catch (error) {
    console.error('\n💥 測試過程中發生錯誤:', error.message);
  }
}

// 執行測試
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRequestVerificationCode,
  testDifferentPhoneFormats,
  runTests
}; 