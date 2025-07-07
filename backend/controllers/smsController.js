const smsService = require('../services/smsService');
const VerificationCode = require('../models/VerificationCode');

// 發送 SMS 驗證碼
const sendSMS = async (req, res) => {
  try {
    console.log('📱 開始處理 SMS 發送請求...');
    
    const { phoneNumber, senderId, purpose = 'phone_verification' } = req.body;
    
    // 驗證電話號碼
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // 驗證香港電話號碼格式
    if (!smsService.validateHongKongPhone(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Hong Kong phone number format'
      });
    }

    // 格式化電話號碼
    const formattedPhone = smsService.formatHongKongPhone(phoneNumber);
    
    // 檢查是否有未過期的驗證碼
    const existingCode = await VerificationCode.findOne({
      phoneNumber: formattedPhone,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingCode) {
      const timeLeft = Math.ceil((existingCode.expiresAt - new Date()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        error: `Please wait ${timeLeft} minutes before requesting a new code`
      });
    }
    
    // 生成驗證碼
    const otp = smsService.generateOTP();
    
    console.log('📱 SMS 發送參數:', {
      phoneNumber: formattedPhone,
      otp: otp,
      senderId: senderId || 'default',
      purpose
    });

    // 發送 SMS
    const result = await smsService.sendVerificationSMS(formattedPhone, otp, senderId);

    // 存儲驗證碼到數據庫
    await VerificationCode.createCode(formattedPhone, otp, purpose, 'sms');

    // 回傳成功響應
    res.json({
      success: true,
      message: 'SMS verification code sent successfully',
      data: {
        phoneNumber: formattedPhone,
        messageId: result.data?.message_id || null,
        expiresIn: '10 minutes',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ SMS 發送失敗:', {
      message: error.message,
      stack: error.stack
    });

    // 回傳錯誤響應
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS'
    });
  }
};

// 驗證 SMS 驗證碼
const verifySMS = async (req, res) => {
  try {
    console.log('🔍 開始驗證 SMS 驗證碼...');
    
    const { phoneNumber, code, purpose = 'phone_verification' } = req.body;
    
    // 驗證輸入
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and verification code are required'
      });
    }

    // 格式化電話號碼
    const formattedPhone = smsService.formatHongKongPhone(phoneNumber);
    
    console.log('🔍 驗證參數:', {
      phoneNumber: formattedPhone,
      code: code,
      purpose
    });

    // 驗證驗證碼
    const verificationResult = await VerificationCode.verifyCode(formattedPhone, code, purpose);

    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        error: verificationResult.reason || 'Invalid verification code'
      });
    }

    // 回傳成功響應
    res.json({
      success: true,
      message: 'Verification code verified successfully',
      data: {
        phoneNumber: formattedPhone,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 驗證碼驗證失敗:', {
      message: error.message,
      stack: error.stack
    });

    // 回傳錯誤響應
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify code'
    });
  }
};

// 測試 SMS 發送（固定號碼）
const testSMS = async (req, res) => {
  try {
    console.log('🧪 開始測試 SMS 發送...');
    
    // 使用固定的測試號碼
    const testPhoneNumber = '+85295011159';
    const otp = smsService.generateOTP();
    
    console.log('🧪 測試 SMS 參數:', {
      phoneNumber: testPhoneNumber,
      otp: otp
    });

    // 發送測試 SMS
    const result = await smsService.sendVerificationSMS(testPhoneNumber, otp);

    // 存儲驗證碼到數據庫
    await VerificationCode.createCode(testPhoneNumber, otp, 'phone_verification', 'sms');

    // 回傳成功響應
    res.json({
      success: true,
      message: 'Test SMS sent successfully',
      data: {
        phoneNumber: testPhoneNumber,
        otp: otp,
        messageId: result.data?.message_id || null,
        expiresIn: '10 minutes',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 測試 SMS 發送失敗:', {
      message: error.message,
      stack: error.stack
    });

    // 回傳錯誤響應
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test SMS'
    });
  }
};

// 驗證電話號碼格式
const validatePhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const isValid = smsService.validateHongKongPhone(phoneNumber);
    const formatted = smsService.formatHongKongPhone(phoneNumber);

    res.json({
      success: true,
      data: {
        phoneNumber: phoneNumber,
        isValid: isValid,
        formatted: formatted,
        isFormatted: phoneNumber !== formatted
      }
    });

  } catch (error) {
    console.error('❌ 電話號碼驗證失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate phone number'
    });
  }
};

module.exports = {
  sendSMS,
  verifySMS,
  testSMS,
  validatePhone
}; 