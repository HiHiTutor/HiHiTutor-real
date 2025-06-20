const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById, getTutorByTutorId, getTutorProfile, updateTutorProfile } = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/auth');

// 公開 API
router.get('/', getAllTutors);
router.get('/:id', getTutorById);
router.get('/detail/:tutorId', getTutorByTutorId);

// 需要認證的 API
router.get('/profile', verifyToken, getTutorProfile);
router.put('/profile', verifyToken, updateTutorProfile);

module.exports = router; 