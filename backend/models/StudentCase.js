const mongoose = require('mongoose');

const studentCaseSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentCase', studentCaseSchema); 