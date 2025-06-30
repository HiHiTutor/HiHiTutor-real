const BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function testCorrectTutorId() {
  console.log('🧪 測試正確的 tutorId 查詢...\n');

  // 正確的 tutorId
  const correctTutorId = 'T00016';
  
  try {
    console.log(`🔍 使用正確的 tutorId: ${correctTutorId}`);
    
    const response = await fetch(`${BASE_URL}/api/tutors/detail/${correctTutorId}`);
    const data = await response.json();
    
    console.log(`📊 狀態碼: ${response.status}`);
    console.log(`📦 回應:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log('✅ 查詢成功！');
      console.log(`👤 導師名稱: ${data.data.name}`);
      console.log(`🆔 TutorId: ${data.data.tutorId}`);
      console.log(`📧 用戶ID: ${data.data.userId}`);
    } else {
      console.log('❌ 查詢失敗');
    }
    
  } catch (error) {
    console.error(`❌ 測試失敗:`, error.message);
  }
}

testCorrectTutorId(); 