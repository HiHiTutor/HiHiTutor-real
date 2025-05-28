const mongoose = require('mongoose');

const studentCaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  tutorId: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false
  },
  subjects: {
    type: [String],
    required: false
  },
  location: {
    type: String,
    required: false
  },
  budget: {
    type: String,
    required: false,
    default: ''
  },
  mode: {
    type: String,
    required: false,
    enum: ['面對面', '線上', 'both', '網課', '面授', 'offline', 'online', 'in-person'],
    default: '線上'
  },
  modes: {
    type: [String],
    required: false
  },
  requirement: {
    type: String,
    required: false
  },
  requirements: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false,
    default: ''
  },
  subCategory: {
    type: String,
    required: false
  },
  region: {
    type: [String],
    required: false
  },
  regions: {
    type: [String],
    required: false
  },
  subRegions: {
    type: [String],
    required: false
  },
  priceRange: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: false,
    default: 60
  },
  durationUnit: {
    type: String,
    required: false,
    default: 'minutes'
  },
  weeklyLessons: {
    type: Number,
    required: false,
    default: 1
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
    required: false
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