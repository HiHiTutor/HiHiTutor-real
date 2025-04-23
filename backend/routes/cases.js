const express = require('express');
const router = express.Router();
const { getAllCases, getLatestCases, getCaseById } = require('../controllers/caseController');

router.get('/', getAllCases);
router.get('/latest', getLatestCases);
router.get('/:id', getCaseById);

module.exports = router; 