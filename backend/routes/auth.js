const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  register, 
  getUserProfile, 
  getCurrentUser, 
  forgotPassword, 
  resetPassword,
  updateUserProfile,
  requestTutorUpgrade,
  sendVerificationCode,
  verifyCode
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', register);
router.post('/request-verification-code', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Missing phone number' });
  }

  console.log(`[SMS] 模擬發送驗證碼到 ${phone}`);
  return res.status(200).json({ success: true, message: '驗證碼已發送' });
});
router.post('/verify-code', verifyCode);
router.post('/request-tutor-upgrade', verifyToken, requestTutorUpgrade);
router.get('/me', verifyToken, getCurrentUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router; 