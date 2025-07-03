const express = require('express');
const router = express.Router();
const { getAllStudentCases, createStudentCase, getStudentCaseById, searchStudentCases } = require('../controllers/studentCaseController');

// GET all student cases
router.get('/', getAllStudentCases);

// 搜尋學生案例
router.get('/search', searchStudentCases);

// GET single student case
router.get('/:id', getStudentCaseById);

// POST new student case
router.post('/', createStudentCase);

module.exports = router; 