const mongoose = require('mongoose');

const studentCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['online', 'offline', 'both']
  },
  requirement: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: [String],
    required: true
  },
  region: {
    type: [String],
    required: true
  },
  priceRange: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'in_progress'],
    default: 'open'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// 更新 updatedAt 欄位
studentCaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StudentCase', studentCaseSchema); 