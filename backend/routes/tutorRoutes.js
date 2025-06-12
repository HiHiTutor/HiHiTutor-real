const express = require('express');
const router = express.Router();
const { getTutors, getTutorDetail, getTutorProfile, updateTutorProfile } = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/auth');

// 公開 API
router.get('/', getTutors);
router.get('/detail/:tutorId', getTutorDetail);

// 需要認證的 API
router.use(verifyToken);
router.get('/profile', getTutorProfile);
router.put('/profile', updateTutorProfile);

module.exports = router; 