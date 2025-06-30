const BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app';

async function testCompleteFlow() {
  console.log('🧪 測試完整的導師查詢流程...\n');

  // 測試用例
  const testCases = [
    {
      name: '正確的 tutorId',
      id: 'T00016',
      expectedSuccess: true
    },
    {
      name: '錯誤的 userId',
      id: '0000010',
      expectedSuccess: false
    },
    {
      name: '錯誤的 MongoDB _id',
      id: '685f9999dc484c30ad37cc43',
      expectedSuccess: false
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🔍 測試: ${testCase.name}`);
      console.log(`📡 使用 ID: ${testCase.id}`);
      
      // 測試新的 API 端點
      const response = await fetch(`${BASE_URL}/api/tutors/detail/${testCase.id}`);
      const data = await response.json();
      
      console.log(`📊 狀態碼: ${response.status}`);
      console.log(`📦 回應:`, JSON.stringify(data, null, 2));
      
      // 驗證結果
      const isSuccess = response.status === 200 && data.success;
      const isExpected = isSuccess === testCase.expectedSuccess;
      
      console.log(`✅ 結果: ${isSuccess ? '成功' : '失敗'}`);
      console.log(`🎯 預期: ${testCase.expectedSuccess ? '成功' : '失敗'}`);
      console.log(`📋 驗證: ${isExpected ? '✅ 通過' : '❌ 失敗'}`);
      
      if (isSuccess && data.data) {
        console.log(`👤 導師名稱: ${data.data.name}`);
        console.log(`🆔 TutorId: ${data.data.tutorId}`);
      }
      
      console.log('---\n');
    } catch (error) {
      console.error(`❌ 測試失敗:`, error.message);
      console.log('---\n');
    }
  }

  console.log('🎉 測試完成！');
}

testCompleteFlow(); 