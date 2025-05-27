const { sendVerificationCode } = require('../../src/controllers/authController');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await sendVerificationCode(req, res);
  } catch (error) {
    console.error('Error in request-verification-code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 