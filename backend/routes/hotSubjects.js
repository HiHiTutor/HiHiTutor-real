const express = require('express');
const router = express.Router();
const { getHotSubjects } = require('../controllers/hotSubjectController');

router.get('/', getHotSubjects);

module.exports = router; 