const express = require('express');
const router = express.Router();
const { getAllStudentCases, createStudentCase, getStudentCaseById } = require('../controllers/studentCaseController');

// GET all student cases
router.get('/', getAllStudentCases);

// GET single student case
router.get('/:id', getStudentCaseById);

// POST new student case
router.post('/', createStudentCase);

module.exports = router; 