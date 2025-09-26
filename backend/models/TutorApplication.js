const mongoose = require('mongoose');

const tutorApplicationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  userNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  courseFeatures: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  regions: [{
    type: String
  }],
  teachingMode: [{
    type: String
  }],
  hourlyRate: {
    type: String,
    required: true
  },
  documents: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedAt: {
    type: Date
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TutorApplication', tutorApplicationSchema); 