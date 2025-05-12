const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '姓名為必填欄位'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '電子郵件為必填欄位'],
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: [true, '訊息為必填欄位'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema); 