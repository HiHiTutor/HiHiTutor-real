const express = require('express');
const router = express.Router();
const { applyTutor } = require('../controllers/tutorApplicationController');

// POST /api/tutors/:id/apply
router.post('/:id/apply', applyTutor);

module.exports = router; 