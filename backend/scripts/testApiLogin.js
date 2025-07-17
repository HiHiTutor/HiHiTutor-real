const axios = require('axios');

async function testApiLogin() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';
    
    console.log('🔍 Testing API login...');
    console.log('API URL:', `${API_BASE_URL}/admin/auth/login`);
    
    const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      identifier: '60761408',
      password: 'password' // 假設密碼是 password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', {
      status: response.status,
      success: response.data.success,
      userType: response.data.user?.userType,
      role: response.data.user?.role,
      hasToken: !!response.data.token
    });
    
  } catch (error) {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
  }
}

testApiLogin(); 