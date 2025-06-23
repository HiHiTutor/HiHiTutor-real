const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById, getTutorByTutorId, getTutorProfile, updateTutorProfile } = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/authMiddleware');

// 需要認證的 API (放在前面，避免與 /:id 衝突)
router.get('/profile', verifyToken, getTutorProfile);
router.put('/profile', verifyToken, updateTutorProfile);

// 公開 API
router.get('/', getAllTutors);
router.get('/detail/:tutorId', getTutorByTutorId);
router.get('/:id', getTutorById);

module.exports = router; 