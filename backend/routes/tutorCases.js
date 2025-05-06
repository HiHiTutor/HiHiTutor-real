const express = require('express');
const router = express.Router();
const { createTutorCase, getAllTutorCases } = require('../controllers/tutorCaseController');

router.post('/', createTutorCase);
router.get('/', getAllTutorCases);

module.exports = router; 