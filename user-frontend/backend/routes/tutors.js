const express = require('express');
const router = express.Router();
const { getAllTutors, getRecommendedTutors } = require('../controllers/tutorController');

router.get('/', getAllTutors);
router.get('/recommended', getRecommendedTutors);

module.exports = router; 