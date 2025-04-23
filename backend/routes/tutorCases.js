const express = require('express');
const router = express.Router();
const { getAllTutorCases } = require('../controllers/tutorCaseController');

router.get('/', getAllTutorCases);

module.exports = router; 