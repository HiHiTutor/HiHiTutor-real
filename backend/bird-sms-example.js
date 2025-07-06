// 🚀 Bird SMS 使用範例
const { sendBirdSMS, sendBirdVerificationCode } = require('./utils/sendBirdSMS');

// 使用前請確保：
// 1. 在 backend/.env 檔案中設置 BIRD_ACCESS_KEY
// 2. 已安裝 axios: npm install axios

async function example() {
  try {
    // 範例 1: 發送自訂訊息
    console.log('📱 發送自訂訊息...');
    await sendBirdSMS('+85261234567', 'Hello from HiHiTutor!');
    
    // 範例 2: 發送驗證碼
    console.log('🔐 發送驗證碼...');
    await sendBirdVerificationCode('+85261234567', '123456');
    
    console.log('✅ 所有測試完成！');
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

// 執行範例
example(); 