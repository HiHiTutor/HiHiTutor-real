const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // 允許匿名搜尋
  },
  userType: {
    type: String,
    enum: ['student', 'tutor', 'anonymous'],
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  searchType: {
    type: String,
    enum: ['tutor', 'case', 'subject', 'location', 'general'],
    required: true
  },
  subjects: [{
    type: String
  }],
  regions: [{
    type: String
  }],
  filters: {
    priceRange: String,
    teachingMode: String,
    experience: String
  },
  resultsCount: {
    tutors: Number,
    cases: Number
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引優化
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ searchType: 1, createdAt: -1 });
searchLogSchema.index({ subjects: 1, createdAt: -1 });
searchLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema); 