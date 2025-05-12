const mongoose = require('mongoose');

const tutorCaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
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
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TutorCase', tutorCaseSchema); 