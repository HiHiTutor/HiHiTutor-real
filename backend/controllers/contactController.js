const Contact = require('../models/Contact');

// 提交聯絡表單
const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 驗證必填欄位
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必填欄位'
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '請輸入有效的電子郵件地址'
      });
    }

    // 儲存聯絡表單
    const contact = new Contact({
      name,
      email,
      message
    });

    await contact.save();

    res.status(200).json({
      success: true,
      message: '感謝您的訊息，我們會盡快回覆您！'
    });
  } catch (error) {
    console.error('提交聯絡表單失敗:', error);
    res.status(500).json({
      success: false,
      message: '提交失敗，請稍後再試'
    });
  }
};

module.exports = {
  submitContactForm
}; 