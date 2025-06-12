const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById, getTutorByTutorId } = require('../controllers/tutorController');

router.get('/', getAllTutors);
router.get('/:id', getTutorById);
router.get('/detail/:tutorId', getTutorByTutorId);

module.exports = router; 