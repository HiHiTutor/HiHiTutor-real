const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const {
  getPendingTutorProfiles,
  approveTutorProfile,
  rejectTutorProfile
} = require('../controllers/tutorProfileController');

const router = express.Router();

// 獲取所有待審核的導師個人資料
router.get('/pending', verifyToken, verifyAdmin, getPendingTutorProfiles);

// 批准導師個人資料
router.patch('/:id/approve', verifyToken, verifyAdmin, approveTutorProfile);

// 拒絕導師個人資料
router.patch('/:id/reject', verifyToken, verifyAdmin, rejectTutorProfile);

module.exports = router; 