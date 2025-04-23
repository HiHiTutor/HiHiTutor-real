const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

// GET /api/tutors/recommended
router.get('/recommended', tutorController.getRecommendedTutors);

module.exports = router; 