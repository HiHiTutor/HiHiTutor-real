const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'main-banner', 'sidebar-left', 'sidebar-right', 'footer-left', 'footer-right'],
    required: true
  },
  title: String,
  description: String,
  imageUrl: String,
  link: String,
  order: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: '了解更多'
  },
  buttonColor: {
    type: String,
    default: '#2563eb'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema); 