const axios = require('axios');

// 測試配置
const BASE_URL = 'http://localhost:3001'; // 或者你的 API 基礎 URL
const TEST_PHONE = '61234567'; // 測試用的香港電話號碼

/**
 * 測試驗證碼發送 API
 */
async function testRequestVerificationCode() {
  console.log('🚀 測試驗證碼發送 API...\n');

  try {
    console.log('📱 發送驗證碼到:', TEST_PHONE);
    
    const response = await axios.post(`${BASE_URL}/auth/request-verification-code`, {
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
 * 測試驗證碼驗證 API
 */
async function testVerifyCode(phone, code) {
  console.log('\n🔐 測試驗證碼驗證 API...\n');

  try {
    console.log('📱 驗證電話:', phone);
    console.log('🔢 驗證碼:', code);
    
    const response = await axios.post(`${BASE_URL}/auth/verify-code`, {
      phone: phone,
      code: code
    });

    console.log('✅ 驗證碼驗證成功!');
    console.log('📊 回應:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ 驗證碼驗證失敗:');
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
 * 測試重複發送限制
 */
async function testRateLimit() {
  console.log('\n⏰ 測試重複發送限制...\n');

  try {
    // 第一次發送
    console.log('📱 第一次發送驗證碼...');
    await axios.post(`${BASE_URL}/auth/request-verification-code`, {
      phone: TEST_PHONE
    });
    console.log('✅ 第一次發送成功');

    // 立即嘗試第二次發送
    console.log('📱 立即嘗試第二次發送...');
    await axios.post(`${BASE_URL}/auth/request-verification-code`, {
      phone: TEST_PHONE
    });
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('✅ 重複發送限制正常運作');
      console.log('📊 限制訊息:', error.response.data.message);
    } else {
      console.error('❌ 重複發送限制測試失敗:', error.message);
    }
  }
}

/**
 * 主測試函數
 */
async function runTests() {
  console.log('🧪 開始測試 HiHiTutor 驗證 API 整合 Bird SMS...\n');

  try {
    // 測試 1: 發送驗證碼
    const result = await testRequestVerificationCode();
    
    // 測試 2: 驗證碼驗證（如果在開發環境中有返回驗證碼）
    if (result.code) {
      await testVerifyCode(TEST_PHONE, result.code);
    } else {
      console.log('\n⚠️  生產環境中不會返回驗證碼，跳過驗證測試');
    }

    // 測試 3: 重複發送限制
    await testRateLimit();

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
  testVerifyCode,
  testRateLimit,
  runTests
}; 