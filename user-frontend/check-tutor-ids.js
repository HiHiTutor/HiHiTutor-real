const BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function checkTutorIds() {
  console.log('🔍 檢查資料庫中導師的 tutorId 情況...\n');

  try {
    // 先獲取導師列表
    console.log('📡 獲取導師列表...');
    const listResponse = await fetch(`${BASE_URL}/api/tutors`);
    const listData = await listResponse.json();
    
    if (!listData.success || !listData.data?.tutors) {
      console.log('❌ 無法獲取導師列表');
      return;
    }
    
    const tutors = listData.data.tutors;
    console.log(`✅ 找到 ${tutors.length} 個導師`);
    
    // 檢查每個導師的詳細資料
    for (let i = 0; i < Math.min(tutors.length, 3); i++) { // 只檢查前3個
      const tutor = tutors[i];
      console.log(`\n🔍 檢查導師 ${i + 1}: ${tutor.name}`);
      console.log(`   ID: ${tutor.id}`);
      console.log(`   UserID: ${tutor.userId}`);
      
      // 嘗試用不同的 ID 查詢詳細資料
      const testIds = [
        { type: 'ID', value: tutor.id },
        { type: 'UserID', value: tutor.userId },
        { type: 'TutorId', value: tutor.tutorId }
      ];
      
      for (const testId of testIds) {
        if (!testId.value) continue;
        
        try {
          console.log(`   📡 測試 ${testId.type}: ${testId.value}`);
          const detailResponse = await fetch(`${BASE_URL}/api/tutors/detail/${testId.value}`);
          const detailData = await detailResponse.json();
          
          if (detailResponse.status === 200 && detailData.success) {
            console.log(`   ✅ ${testId.type} 查詢成功！`);
            console.log(`      TutorId: ${detailData.data.tutorId}`);
            console.log(`      UserId: ${detailData.data.userId}`);
            break;
          } else {
            console.log(`   ❌ ${testId.type} 查詢失敗: ${detailData.message}`);
          }
        } catch (error) {
          console.log(`   ❌ ${testId.type} 查詢錯誤: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ 檢查失敗:`, error.message);
  }
}

checkTutorIds(); 