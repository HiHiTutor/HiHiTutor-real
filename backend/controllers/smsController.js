const axios = require('axios');

// 發送 SMS 驗證碼
const sendSMS = async (req, res) => {
  try {
    console.log('📱 開始發送 SMS 驗證碼...');
    
    // 檢查環境變數
    const apiToken = process.env.SMS_TO_API_TOKEN;
    if (!apiToken) {
      console.error('❌ SMS_TO_API_TOKEN 未設定');
      return res.status(500).json({
        success: false,
        error: 'SMS API token not configured'
      });
    }

    // 固定電話號碼和訊息內容
    const phoneNumber = '+85295011159';
    const message = 'Your verification code is 123456';
    
    console.log('📱 SMS 發送參數:', {
      phoneNumber,
      message: message.substring(0, 20) + '...',
      apiToken: apiToken.substring(0, 10) + '...'
    });

    // 調用 SMS.to API
    const response = await axios.post('https://api.sms.to/sms/send', {
      to: phoneNumber,
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      timeout: 10000 // 10秒超時
    });

    console.log('✅ SMS 發送成功:', {
      status: response.status,
      data: response.data
    });

    // 回傳成功響應
    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: response.data
    });

  } catch (error) {
    console.error('❌ SMS 發送失敗:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // 回傳錯誤響應
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send SMS'
    });
  }
};

module.exports = {
  sendSMS
}; 