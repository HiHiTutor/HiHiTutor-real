const express = require('express');
const router = express.Router();
const { approveApplication, rejectApplication } = require('../controllers/applicationController');

// PATCH /api/applications/:id/approve
router.patch('/:id/approve', approveApplication);

// PATCH /api/applications/:id/reject
router.patch('/:id/reject', rejectApplication);

module.exports = router; 