const fetch = require('node-fetch');

async function testCategoryFilter() {
  console.log('🧪 測試分類過濾功能');
  console.log('=' .repeat(50));
  
  const testCases = [
    {
      name: '幼兒教育分類',
      url: 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?category=early-childhood&limit=5'
    },
    {
      name: '小學中學分類',
      url: 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?category=primary-secondary&limit=5'
    },
    {
      name: '興趣班分類',
      url: 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?category=interest&limit=5'
    },
    {
      name: '大學本科分類',
      url: 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?category=tertiary&limit=5'
    },
    {
      name: '成人教育分類',
      url: 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?category=adult&limit=5'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 測試: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(testCase.url);
      const endTime = Date.now();
      
      console.log(`⏱️ 請求耗時: ${endTime - startTime}ms`);
      console.log(`📊 回應狀態: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`❌ 請求失敗: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`📦 API 回應結構:`);
      console.log(`- success: ${data.success}`);
      console.log(`- source: ${data.source}`);
      console.log(`- mongoState: ${data.mongoState} (${data.mongoStateDescription})`);
      
      if (data.data && data.data.tutors) {
        console.log(`✅ 找到導師資料`);
        console.log(`- 導師數量: ${data.data.tutors.length}`);
        
        if (data.data.tutors.length > 0) {
          console.log(`👥 導師列表 (前3個):`);
          data.data.tutors.slice(0, 3).forEach((tutor, index) => {
            console.log(`  ${index + 1}. ${tutor.name} (科目: ${tutor.subjects?.join(', ') || 'N/A'})`);
          });
        } else {
          console.log(`⚠️ 沒有導師資料`);
        }
      } else {
        console.log(`❌ 沒有找到導師資料`);
      }
      
    } catch (error) {
      console.error(`❌ 測試失敗: ${error.message}`);
    }
    
    // 等待一下再測試下一個
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 分類過濾測試完成');
}

// 執行測試
testCategoryFilter(); 