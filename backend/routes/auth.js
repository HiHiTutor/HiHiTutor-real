const express = require('express');
const router = express.Router();
router.use(express.json());
const multer = require('multer');
const { 
  loginUser, 
  register, 
  getUserProfile, 
  getCurrentUser, 
  requestPasswordReset,
  forgotPassword, 
  resetPassword,
  updateUserProfile,
  requestTutorUpgrade,
  sendVerificationCode,
  verifyCode,
  verifyPassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支援的檔案類型。只允許 PDF、JPEG 和 PNG 檔案。'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
    files: 2 // 最多 2 個檔案 (businessRegistration 和 addressProof)
  }
});

router.post('/login', loginUser);
router.post('/register', upload.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 }
]), register);
router.post('/request-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/request-tutor-upgrade', verifyToken, requestTutorUpgrade);
router.get('/me', verifyToken, getCurrentUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/request-password-reset', requestPasswordReset);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-password', verifyToken, verifyPassword);

module.exports = router; 