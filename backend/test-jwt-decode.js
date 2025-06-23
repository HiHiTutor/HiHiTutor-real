const jwt = require('jsonwebtoken');

// 測試 JWT token 解碼
function testJwtDecode() {
  console.log('🧪 JWT Token 解碼測試');
  console.log('========================');
  
  // 模擬一個 JWT token（這裡需要你提供實際的 token）
  const sampleToken = process.argv[2];
  
  if (!sampleToken) {
    console.log('❌ 請提供 JWT token 作為參數');
    console.log('使用方法: node test-jwt-decode.js <your_jwt_token>');
    return;
  }
  
  try {
    const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET || 'your-secret-key');
    
    console.log('✅ JWT Token 解碼成功');
    console.log('📋 Token 內容:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\n🔍 重要欄位檢查:');
    console.log(`- id (MongoDB _id): ${decoded.id}`);
    console.log(`- userId: ${decoded.userId}`);
    console.log(`- email: ${decoded.email}`);
    console.log(`- phone: ${decoded.phone}`);
    console.log(`- role: ${decoded.role}`);
    console.log(`- userType: ${decoded.userType}`);
    
    if (decoded.userId) {
      console.log('✅ userId 欄位存在');
    } else {
      console.log('❌ userId 欄位不存在');
    }
    
  } catch (error) {
    console.log('❌ JWT Token 解碼失敗:', error.message);
  }
}

testJwtDecode(); 