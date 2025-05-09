const express = require('express');
const router = express.Router();
const { getAllTutorCases, createTutorCase, getTutorCaseById } = require('../controllers/tutorCaseController');

// 基礎路由
router.post('/', createTutorCase);
router.get('/', getAllTutorCases);
router.get('/:id', getTutorCaseById);

module.exports = router; 