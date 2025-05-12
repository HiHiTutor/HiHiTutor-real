const express = require('express');
const router = express.Router();
const { getAllStudentCases, createStudentCase, getStudentCaseById } = require('../controllers/studentCaseController');

// GET all student cases
router.get('/', getAllStudentCases);

// GET single student case
router.get('/:id', getStudentCaseById);

// 學生發布個案（找導師）相關路由
router.post('/', createStudentCase);

module.exports = router; 