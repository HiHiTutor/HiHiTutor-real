const express = require('express');
const router = express.Router();
const { sendSMS } = require('../controllers/smsController');

// POST /api/send-sms - 發送驗證碼 SMS
router.post('/send-sms', sendSMS);

module.exports = router; 