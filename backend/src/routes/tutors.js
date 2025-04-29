const express = require('express');
const router = express.Router();
const tutorCases = require('../data/tutorCases.json');

// GET /api/tutors/recommended
router.get('/recommended', (req, res) => {
  const recommendedTutors = tutorCases.filter(tutor => tutor.status === "approved");
  res.json(recommendedTutors);
});

module.exports = router; 