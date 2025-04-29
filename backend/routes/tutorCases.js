const express = require('express');
const router = express.Router();
const { getAllTutorCases, getRecommendedTutorCases } = require('../controllers/tutorCaseController');

// GET all tutor cases
router.get('/', getAllTutorCases);

// GET recommended tutor cases
router.get('/recommended', getRecommendedTutorCases);

module.exports = router; 