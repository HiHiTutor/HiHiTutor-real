const fetch = require('node-fetch');

const BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function testTutorAPI() {
  console.log('🧪 測試導師 API 不同 ID 格式...\n');

  // 測試不同的 ID 格式
  const testIds = [
    '0000010',  // userId
    'T00016',   // tutorId
    '685f9999dc484c30ad37cc43'  // MongoDB _id
  ];

  for (const id of testIds) {
    try {
      console.log(`🔍 測試 ID: ${id}`);
      const response = await fetch(`${BASE_URL}/api/tutors/${id}`);
      const data = await response.json();
      
      console.log(`📊 狀態碼: ${response.status}`);
      console.log(`📦 回應:`, JSON.stringify(data, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error(`❌ 測試 ID ${id} 失敗:`, error.message);
      console.log('---\n');
    }
  }
}

testTutorAPI(); 