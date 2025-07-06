const axios = require('axios');
require('dotenv').config();

// 🔐 API Configuration
const BIRD_ACCESS_KEY = process.env.BIRD_ACCESS_KEY || 'FM7VijIDBhXM5QfpOc1RcZO4UDVNfdcMoaz3';
const WORKSPACE_ID = 'd181cf84-f717-48f6-8c5a-1d6e0ffdc07b';
const CHANNEL_ID = '331127f9-8ba7-5c83-8d1b-18de4ceff379';

/**
 * Send SMS using Bird.com API
 * @param {string} phone - Phone number (e.g., '+85261234567')
 * @param {string} message - Message content
 * @returns {Promise} - API response
 */
async function sendBirdSMS(phone, message) {
  try {
    console.log('🚀 Sending SMS via Bird.com API...');
    console.log('📱 Phone:', phone);
    console.log('💬 Message:', message);

    const response = await axios.post(
      `https://api.bird.com/workspaces/${WORKSPACE_ID}/channels/${CHANNEL_ID}/messages`,
      {
        body: {
          type: "text",
          text: {
            text: message
          }
        },
        receiver: {
          contacts: [
            {
              identifierValue: phone,
              identifierKey: "phonenumber"
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `AccessKey ${BIRD_ACCESS_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Bird SMS sent successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Bird SMS error:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Send verification code SMS via Bird.com
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 * @returns {Promise} - API response
 */
async function sendBirdVerificationCode(phone, code) {
  const message = `【HiHiTutor】您的驗證碼是 ${code}，請於10分鐘內輸入。`;
  return sendBirdSMS(phone, message);
}

module.exports = {
  sendBirdSMS,
  sendBirdVerificationCode
}; 