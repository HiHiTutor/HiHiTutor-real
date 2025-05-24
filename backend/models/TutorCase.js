const mongoose = require('mongoose');

const tutorCaseSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('TutorCase', tutorCaseSchema); 