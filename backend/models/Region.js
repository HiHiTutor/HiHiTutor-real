const mongoose = require('mongoose');

const subRegionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  }
});

const regionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  regions: [subRegionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
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

// 更新時自動更新 updatedAt
regionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引
regionSchema.index({ value: 1 });
regionSchema.index({ isActive: 1 });
regionSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Region', regionSchema);
