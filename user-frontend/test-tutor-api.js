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
      
      // 測試舊的 API 端點（應該返回 404）
      console.log(`📡 測試舊端點: /api/tutors/${id}`);
      const oldResponse = await fetch(`${BASE_URL}/api/tutors/${id}`);
      console.log(`📊 舊端點狀態碼: ${oldResponse.status}`);
      
      // 測試新的 API 端點
      console.log(`📡 測試新端點: /api/tutors/detail/${id}`);
      const newResponse = await fetch(`${BASE_URL}/api/tutors/detail/${id}`);
      const data = await newResponse.json();
      
      console.log(`📊 新端點狀態碼: ${newResponse.status}`);
      console.log(`📦 新端點回應:`, JSON.stringify(data, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error(`❌ 測試 ID ${id} 失敗:`, error.message);
      console.log('---\n');
    }
  }
}

testTutorAPI(); 