const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById } = require('../controllers/tutorController');

router.get('/', getAllTutors);
router.get('/:id', getTutorById);

module.exports = router; 