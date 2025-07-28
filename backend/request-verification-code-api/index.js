const express = require('express');
const app = express();
const { sendBirdVerificationCode } = require('../utils/sendBirdSMS');

app.use(express.json({ limit: '10mb' }));

app.post('/api/auth/request-verification-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Missing phone number' });
  }

  // 產生驗證碼
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log(`📱 準備發送驗證碼 ${code} 到 ${phone}`);

  try {
    // 格式化電話號碼為 +852XXXXXXX 格式
    const formattedPhone = phone.startsWith('+') ? phone : `+852${phone}`;
    console.log(`📞 格式化電話號碼: ${phone} -> ${formattedPhone}`);

    // 使用 Bird.com API 發送驗證碼
    await sendBirdVerificationCode(formattedPhone, code);
    console.log('✅ Bird SMS 發送成功');
    
    return res.status(200).json({ 
      success: true, 
      message: '驗證碼已發送',
      code: process.env.NODE_ENV === 'development' ? code : undefined // 開發環境顯示驗證碼
    });
  } catch (err) {
    console.error('❌ Bird SMS 發送失敗:', err.message);
    if (err.response) {
      console.error('API 回應狀態:', err.response.status);
      console.error('API 回應資料:', err.response.data);
    }
    return res.status(500).json({ 
      success: false, 
      message: 'SMS 發送失敗', 
      error: err.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Bird SMS 驗證 API 服務已啟動，端口: ${PORT}`);
}); 