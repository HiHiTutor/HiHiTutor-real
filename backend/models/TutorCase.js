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
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TutorCase', tutorCaseSchema); 