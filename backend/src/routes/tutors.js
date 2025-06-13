const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/tutors
router.get('/', async (req, res) => {
  try {
    const tutors = await User.find({ userType: 'tutor' });
    res.json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
});

// GET /api/tutors/recommended
router.get('/recommended', async (req, res) => {
  try {
    const recommendedTutors = await User.find({
      userType: 'tutor',
      'tutorProfile.applicationStatus': 'approved',
      isTop: true
    });
    res.json(recommendedTutors);
  } catch (error) {
    console.error('Error fetching recommended tutors:', error);
    res.status(500).json({ message: 'Error fetching recommended tutors' });
  }
});

module.exports = router; 