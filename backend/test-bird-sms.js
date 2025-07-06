const { sendBirdSMS, sendBirdVerificationCode } = require('./utils/sendBirdSMS');

/**
 * Test Bird SMS functionality
 */
async function testBirdSMS() {
  console.log('🚀 Testing Bird.com SMS API...\n');

  // Test 1: Send custom message
  try {
    console.log('📱 Test 1: Sending custom message...');
    const result1 = await sendBirdSMS('+85261234567', 'Hello from Bird SMS! This is a test message.');
    console.log('✅ Custom message sent successfully!');
  } catch (error) {
    console.error('❌ Custom message failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Send verification code
  try {
    console.log('🔐 Test 2: Sending verification code...');
    const verificationCode = '123456';
    const result2 = await sendBirdVerificationCode('+85261234567', verificationCode);
    console.log('✅ Verification code sent successfully!');
  } catch (error) {
    console.error('❌ Verification code failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Error handling - invalid phone number
  try {
    console.log('⚠️  Test 3: Testing error handling with invalid phone...');
    await sendBirdSMS('invalid-phone', 'This should fail');
  } catch (error) {
    console.log('✅ Error properly caught:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Test with different phone format
  try {
    console.log('📞 Test 4: Testing with different phone format...');
    await sendBirdSMS('85261234567', 'Testing without + prefix');
    console.log('✅ Phone without + prefix sent successfully!');
  } catch (error) {
    console.error('❌ Phone format test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testBirdSMS().catch(console.error);
}

module.exports = testBirdSMS; 