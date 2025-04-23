const express = require('express');
const router = express.Router();
const { getAllTutors, getRecommendedTutors, getTutorById } = require('../controllers/tutorController');

router.get('/', getAllTutors);
router.get('/recommended', getRecommendedTutors);
router.get('/:id', getTutorById);

module.exports = router; 