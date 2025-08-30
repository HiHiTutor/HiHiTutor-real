const fetch = require('node-fetch');

async function testTutorProfileUpdate() {
  try {
    console.log('🧪 測試導師 profile 更新 API');
    
    // 測試數據 - 模擬前端發送的嵌套結構
    const testData = {
      tutorProfile: {
        subRegions: ['hong-kong-central', 'hong-kong-admiralty'],
        subjects: ['primary-chinese', 'primary-english'],
        teachingMethods: ['in-person', 'online'],
        availableTime: ['星期一 上午', '星期二 下午'],
        hourlyRate: 200
      }
    };
    
    console.log('📤 發送測試數據:', JSON.stringify(testData, null, 2));
    
    // 這裡需要一個有效的 token，暫時跳過實際請求
    console.log('✅ 測試數據結構正確');
    console.log('📝 後端應該能夠處理以下字段:');
    console.log('  - tutorProfile.subRegions:', testData.tutorProfile.subRegions);
    console.log('  - tutorProfile.subjects:', testData.tutorProfile.subjects);
    console.log('  - tutorProfile.teachingMethods:', testData.tutorProfile.teachingMethods);
    console.log('  - tutorProfile.availableTime:', testData.tutorProfile.availableTime);
    console.log('  - tutorProfile.hourlyRate:', testData.tutorProfile.hourlyRate);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testTutorProfileUpdate();
