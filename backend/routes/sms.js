const express = require('express');
const router = express.Router();
const { sendSMS, verifySMS, testSMS, validatePhone } = require('../controllers/smsController');

// POST /api/send-sms - 發送驗證碼 SMS
router.post('/send-sms', sendSMS);

// POST /api/verify-sms - 驗證 SMS 驗證碼
router.post('/verify-sms', verifySMS);

// POST /api/test-sms - 測試 SMS 發送（固定號碼）
router.post('/test-sms', testSMS);

// POST /api/validate-phone - 驗證電話號碼格式
router.post('/validate-phone', validatePhone);

module.exports = router; 