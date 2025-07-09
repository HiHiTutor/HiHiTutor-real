const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testResetPassword() {
  try {
    console.log('🧪 開始測試重設密碼功能...\n');

    // 1. 測試 forgot-password API
    console.log('1️⃣ 測試 forgot-password API...');
    console.log('📡 發送請求到:', `${API_BASE}/api/auth/forgot-password`);
    
    const forgotPasswordResponse = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
      identifier: 'test@example.com'
    });
    
    console.log('✅ forgot-password 回應:', forgotPasswordResponse.data);
    
    if (forgotPasswordResponse.data.success && forgotPasswordResponse.data.resetToken) {
      const token = forgotPasswordResponse.data.resetToken;
      console.log('🔑 獲得的 reset token:', token);
      
      // 2. 測試 reset-password API
      console.log('\n2️⃣ 測試 reset-password API...');
      console.log('📡 發送請求到:', `${API_BASE}/api/auth/reset-password`);
      
      const resetPasswordResponse = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token: token,
        newPassword: 'newpassword123'
      });
      
      console.log('✅ reset-password 回應:', resetPasswordResponse.data);
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:');
    if (error.response) {
      console.error('📊 狀態碼:', error.response.status);
      console.error('📄 回應數據:', error.response.data);
      console.error('📋 回應標頭:', error.response.headers);
    } else if (error.request) {
      console.error('🌐 網路錯誤:', error.request);
    } else {
      console.error('💥 其他錯誤:', error.message);
    }
    console.error('🔍 完整錯誤:', error);
  }
}

// 執行測試
testResetPassword(); 