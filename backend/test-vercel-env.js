require('dotenv').config();

console.log('🔍 Vercel 環境檢查...');
console.log('========================');

// 檢查環境變數
console.log('📋 環境變數:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri.replace(/(mongodb\+srv?:\/\/[^:]+:)[^@]+(@.*)/, '$1[PASSWORD]$2');
  console.log('- MONGODB_URI:', maskedUri);
  console.log('- MONGODB_URI length:', uri.length);
  console.log('- MONGODB_URI starts with:', uri.substring(0, 20) + '...');
} else {
  console.log('❌ MONGODB_URI 未設定！');
}

// 檢查其他重要環境變數
console.log('\n🔑 其他環境變數:');
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('- AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('- AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('- AWS_REGION exists:', !!process.env.AWS_REGION);
console.log('- AWS_S3_BUCKET exists:', !!process.env.AWS_S3_BUCKET);

console.log('\n✅ 環境檢查完成'); 