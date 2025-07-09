const crypto = require('crypto');

// 生成測試用的 reset token
const token = crypto.randomBytes(32).toString('hex');
const resetLink = `https://www.hihitutor.com/reset-password?token=${token}`;

console.log('🔑 測試用 Reset Token:', token);
console.log('🔗 Reset Link:', resetLink);
console.log('\n📝 您可以使用這個連結來測試重設密碼頁面的 UI/UX');
console.log('⚠️  注意：這只是一個測試 token，不會真正重設密碼'); 