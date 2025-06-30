const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 測試前端 API 調用');
  console.log('=' .repeat(50));
  
  const baseURL = 'http://localhost:3000';
  const apiUrl = `${baseURL}/api/tutors?featured=true&limit=8`;
  
  try {
    console.log('📡 發送請求到:', apiUrl);
    
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const endTime = Date.now();
    
    console.log('⏱️ 請求耗時:', endTime - startTime, 'ms');
    console.log('📊 回應狀態:', response.status, response.statusText);
    
    const data = response.data;
    
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
          console.log(`  ${index + 1}. ${tutor.name} (tutorId: ${tutor.tutorId}, VIP: ${tutor.isVip}, Top: ${tutor.isTop}, Rating: ${tutor.rating})`);
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
    if (error.response) {
      console.error('📊 錯誤狀態:', error.response.status);
      console.error('📦 錯誤資料:', error.response.data);
    }
  }
}

testFrontendAPI(); 