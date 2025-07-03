const express = require('express');
const router = express.Router();
const { getAllTutorCases, createTutorCase, getTutorCaseById, searchTutorCases } = require('../controllers/tutorCaseController');

// GET all tutor cases
router.get('/', getAllTutorCases);

// 搜尋導師案例
router.get('/search', searchTutorCases);

// GET single tutor case
router.get('/:id', getTutorCaseById);

// 導師發布個案相關路由
router.post('/', createTutorCase);

module.exports = router; 