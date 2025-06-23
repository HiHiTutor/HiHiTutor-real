const fetch = require('node-fetch');

async function testFrontendApi() {
  try {
    console.log('🧪 測試前端 API 代理...');
    
    const frontendURL = 'https://hi-hi-tutor-real.vercel.app';
    const tutorId = '1000002';
    
    console.log('🔍 測試 URL:', `${frontendURL}/api/tutors/${tutorId}`);
    
    const response = await fetch(`${frontendURL}/api/tutors/${tutorId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 響應狀態:', response.status);
    console.log('📊 響應標頭:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 錯誤:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API 響應:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testFrontendApi(); 