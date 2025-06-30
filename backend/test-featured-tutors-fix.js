const fetch = require('node-fetch');

async function testFeaturedTutorsAPI() {
  console.log('🧪 測試修復後的 Featured Tutors API');
  console.log('=' .repeat(50));
  
  const apiUrl = 'https://hi-hi-tutor-real-backend2.vercel.app/api/tutors?featured=true&limit=8';
  
  try {
    console.log('📡 發送請求到:', apiUrl);
    
    const startTime = Date.now();
    const response = await fetch(apiUrl);
    const endTime = Date.now();
    
    console.log('⏱️ 請求耗時:', endTime - startTime, 'ms');
    console.log('📊 回應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📦 API 回應結構:');
    console.log('- success:', data.success);
    console.log('- source:', data.source);
    console.log('- mongoState:', data.mongoState, '(', data.mongoStateDescription, ')');
    
    if (data.data && data.data.tutors) {
      console.log('✅ 找到 tutors 資料');
      console.log('- 導師數量:', data.data.tutors.length);
      
      if (data.data.tutors.length > 0) {
        console.log('👥 導師列表:');
        data.data.tutors.forEach((tutor, index) => {
          console.log(`  ${index + 1}. ${tutor.name} (VIP: ${tutor.isVip}, Top: ${tutor.isTop}, Rating: ${tutor.rating})`);
        });
      } else {
        console.log('⚠️ 沒有導師資料');
      }
    } else {
      console.log('❌ 沒有找到 tutors 資料');
      console.log('📋 完整回應:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

// 執行測試
testFeaturedTutorsAPI(); 