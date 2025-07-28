const express = require('express');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/api/auth/verify-code', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Missing phone or code' });
  }

  console.log(`[SMS] 模擬驗證碼 ${code} 到 ${phone}`);
  return res.status(200).json({ success: true, message: '驗證成功' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 