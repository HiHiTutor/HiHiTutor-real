const mongoose = require('mongoose');

const tutorCaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'closed', 'pending'],
    default: 'open'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  subjects: {
    type: [String],
    required: true
  },
  regions: {
    type: [String],
    default: []
  },
  subRegions: {
    type: [String],
    default: []
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  mode: {
    type: String
  },
  experience: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// 添加虛擬字段
tutorCaseSchema.virtual('type').get(function() {
  return 'tutor';
});

module.exports = mongoose.model('TutorCase', tutorCaseSchema); 