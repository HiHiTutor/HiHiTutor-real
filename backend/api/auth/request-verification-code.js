const { sendVerificationCode } = require('../../src/controllers/authController');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 強制將請求 body 解析為 JSON
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }
    await sendVerificationCode(req, res);
  } catch (error) {
    console.error('Error in request-verification-code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 