const axios = require('axios');

// 🔐 API Key
const MESSAGEBIRD_API_KEY = 'FM7VijIDBhXM5QfpOc1RcZO4UDVNfdcMoaz3';

/**
 * Send SMS using MessageBird API
 * @param {string} to - Phone number (e.g., '85291234567')
 * @param {string} message - Message content
 * @returns {Promise} - API response
 */
async function sendSMS(to, message) {
  try {
    const response = await axios.post('https://rest.messagebird.com/messages', 
      new URLSearchParams({
        originator: 'HiHiTutor',
        recipients: to,
        body: message
      }), 
      {
        headers: {
          'Authorization': `AccessKey ${MESSAGEBIRD_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ MessageBird SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ MessageBird SMS error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send verification code SMS
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 * @returns {Promise} - API response
 */
async function sendVerificationCode(phone, code) {
  const message = `【HiHiTutor】您的驗證碼是 ${code}，請於10分鐘內輸入。`;
  return sendSMS(phone, message);
}

module.exports = {
  sendSMS,
  sendVerificationCode
}; 