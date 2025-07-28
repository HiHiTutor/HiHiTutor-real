const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorByTutorId, getTutorProfile, updateTutorProfile, testTutors } = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/authMiddleware');

// 測試端點
router.get('/test', testTutors);

// 需要認證的 API (放在前面，避免與 /:id 衝突)
router.get('/profile', verifyToken, getTutorProfile);
router.put('/profile', verifyToken, updateTutorProfile);

// 公開 API - 只允許用 tutorId 查詢
router.get('/', getAllTutors);
router.get('/detail/:tutorId', getTutorByTutorId);
router.get('/:id', getTutorByTutorId); // 支援 /api/tutors/:id 格式

module.exports = router; 