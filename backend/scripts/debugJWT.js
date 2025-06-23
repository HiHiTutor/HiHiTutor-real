const jwt = require('jsonwebtoken');
require('dotenv').config();

// 從你的登入回應中複製的 token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N…DcwfQ.niiRx8o2X7ODx_zHqU0mGyTR3IF5Nvj3gDu0KX5NhIg';

console.log('🔍 調試 JWT Token:');
console.log('Token:', token);

try {
  // 解碼 token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  
  console.log('\n✅ JWT Token 解碼成功:');
  console.log('解碼內容:', JSON.stringify(decoded, null, 2));
  
  console.log('\n📋 關鍵欄位:');
  console.log(`  id: ${decoded.id}`);
  console.log(`  userId: ${decoded.userId}`);
  console.log(`  email: ${decoded.email}`);
  console.log(`  userType: ${decoded.userType}`);
  console.log(`  role: ${decoded.role}`);
  
  // 模擬 getTutorProfile 的邏輯
  console.log('\n🔍 模擬 getTutorProfile 邏輯:');
  console.log(`  req.user.userId: ${decoded.userId}`);
  console.log(`  req.user.id: ${decoded.id}`);
  console.log(`  req.user.userType: ${decoded.userType}`);
  
} catch (error) {
  console.error('❌ JWT Token 解碼失敗:', error.message);
} 