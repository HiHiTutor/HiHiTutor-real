// 提交聯絡表單
const submitContactForm = (req, res) => {
  const { name, email, message } = req.body;
  
  // 檢查是否提供所有必要欄位
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: '請提供 name、email 和 message'
    });
  }
  
  // 檢查 email 格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: '請提供有效的 email 格式'
    });
  }
  
  // 模擬處理聯絡表單
  // 注意：在實際應用中，這裡應該要將聯絡表單資料存入資料庫或發送通知
  console.log('收到聯絡表單：', { name, email, message });
  
  // 回傳成功訊息
  res.status(201).json({
    success: true,
    message: '聯絡訊息已成功提交'
  });
};

module.exports = {
  submitContactForm
}; 