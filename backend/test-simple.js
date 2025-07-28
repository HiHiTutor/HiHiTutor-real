// 簡單測試 emailService
const { sendResetPasswordEmail } = require('./utils/emailService');

async function testEmailService() {
  try {
    console.log('🧪 測試 emailService...');
    
    // 設置測試環境變數
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'test-password';
    process.env.SMTP_FROM = 'test@example.com';
    
    console.log('📧 環境變數設置完成');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST);
    console.log('- SMTP_PORT:', process.env.SMTP_PORT);
    
    // 測試 sendResetPasswordEmail 函數
    const testEmail = 'test@example.com';
    const testResetLink = 'https://hihitutor.com/reset-password?token=test-token-123';
    
    console.log('📤 嘗試發送測試 email...');
    await sendResetPasswordEmail(testEmail, testResetLink);
    
    console.log('✅ emailService 測試完成');
    
  } catch (error) {
    console.error('❌ emailService 測試失敗:', error.message);
    console.error('🔍 完整錯誤:', error);
  }
}

testEmailService(); 