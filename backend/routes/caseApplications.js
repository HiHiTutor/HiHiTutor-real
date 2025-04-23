const express = require('express');
const router = express.Router();
const { applyCase } = require('../controllers/caseApplicationController');

// POST /api/cases/:id/apply
router.post('/:id/apply', applyCase);

module.exports = router; 