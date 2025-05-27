const { sendVerificationCode } = require('../../src/controllers/authController');
const express = require('express');
const app = express();

// 添加 JSON 解析中間件
app.use(express.json());

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await sendVerificationCode(req, res);
  } catch (error) {
    console.error('Error in request-verification-code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 