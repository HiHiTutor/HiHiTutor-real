const { sendSMS, sendVerificationCode } = require('./utils/sendSMS');

/**
 * Sample test for MessageBird SMS functionality
 */
async function testSMS() {
  console.log('🚀 Testing MessageBird SMS API...\n');

  // Test 1: Send custom message
  try {
    console.log('📱 Test 1: Sending custom message...');
    const result1 = await sendSMS('85291234567', 'Hello from HiHiTutor! This is a test message.');
    console.log('✅ Custom message sent successfully:', result1);
  } catch (error) {
    console.error('❌ Custom message failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Send verification code
  try {
    console.log('🔐 Test 2: Sending verification code...');
    const verificationCode = '123456';
    const result2 = await sendVerificationCode('85291234567', verificationCode);
    console.log('✅ Verification code sent successfully:', result2);
  } catch (error) {
    console.error('❌ Verification code failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Error handling - invalid phone number
  try {
    console.log('⚠️  Test 3: Testing error handling with invalid phone...');
    await sendSMS('invalid-phone', 'This should fail');
  } catch (error) {
    console.log('✅ Error properly caught:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testSMS().catch(console.error);
}

module.exports = testSMS; 