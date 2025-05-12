const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, '問題為必填欄位'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, '答案為必填欄位'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '分類為必填欄位'],
    enum: ['一般問題', '收費問題', '課程問題', '其他'],
    default: '一般問題'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FAQ', faqSchema); 