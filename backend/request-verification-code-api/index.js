const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/request-verification-code', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Missing phone number' });
  }

  console.log(`[SMS] 模擬發送驗證碼到 ${phone}`);
  return res.status(200).json({ success: true, message: '驗證碼已發送' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 