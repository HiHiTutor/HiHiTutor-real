const express = require('express');
const multer = require('multer');
const extractUserId = require('../middleware/extractUserId');
const { uploadToS3 } = require('../uploadMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
router.post('/', extractUserId, upload.single('file'), uploadToS3);

module.exports = router; 