const BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function testTutorList() {
  console.log('🧪 測試導師列表 API 是否回傳 tutorId...\n');

  try {
    console.log('🔍 獲取導師列表...');
    
    const response = await fetch(`${BASE_URL}/api/tutors`);
    const data = await response.json();
    
    console.log(`📊 狀態碼: ${response.status}`);
    
    if (response.status === 200 && data.success && data.data?.tutors) {
      const tutors = data.data.tutors;
      console.log(`✅ 成功獲取 ${tutors.length} 個導師`);
      
      // 檢查每個導師是否有 tutorId
      tutors.forEach((tutor, index) => {
        console.log(`\n👤 導師 ${index + 1}:`);
        console.log(`  名稱: ${tutor.name}`);
        console.log(`  ID: ${tutor.id}`);
        console.log(`  UserID: ${tutor.userId}`);
        console.log(`  TutorId: ${tutor.tutorId || '❌ 缺少 tutorId'}`);
        
        if (!tutor.tutorId) {
          console.log('⚠️ 這個導師缺少 tutorId！');
        }
      });
      
      // 統計
      const tutorsWithTutorId = tutors.filter(t => t.tutorId).length;
      console.log(`\n📊 統計:`);
      console.log(`- 總導師數: ${tutors.length}`);
      console.log(`- 有 tutorId 的導師: ${tutorsWithTutorId}`);
      console.log(`- 缺少 tutorId 的導師: ${tutors.length - tutorsWithTutorId}`);
      
    } else {
      console.log('❌ 獲取導師列表失敗');
      console.log('📦 回應:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ 測試失敗:`, error.message);
  }
}

testTutorList(); 