const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['tutor', 'student'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  grade: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active'
  },
  promotionLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
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

// Update the updatedAt timestamp before saving
caseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
caseSchema.index({ type: 1, status: 1 });
caseSchema.index({ subjects: 1 });
caseSchema.index({ title: 'text', content: 'text' });
caseSchema.index({ promotionLevel: -1 });
caseSchema.index({ createdAt: -1 });

const Case = mongoose.model('Case', caseSchema);

module.exports = Case; 