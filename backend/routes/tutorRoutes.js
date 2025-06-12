const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/auth');

// 公開 API
router.get('/', tutorController.getTutors);
router.get('/detail/:tutorId', tutorController.getTutorDetail);

// 需要認證的 API
router.use(verifyToken);
router.get('/profile', tutorController.getTutorProfile);
router.put('/profile', tutorController.updateTutorProfile);

module.exports = router; 