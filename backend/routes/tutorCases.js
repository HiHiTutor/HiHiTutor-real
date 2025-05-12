const express = require('express');
const router = express.Router();
const { getAllTutorCases, createTutorCase, getTutorCaseById } = require('../controllers/tutorCaseController');

// GET all tutor cases
router.get('/', getAllTutorCases);

// GET single tutor case
router.get('/:id', getTutorCaseById);

// 導師發布個案相關路由
router.post('/', createTutorCase);

module.exports = router; 