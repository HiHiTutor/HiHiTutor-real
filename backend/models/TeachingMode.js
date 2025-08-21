const mongoose = require('mongoose');

const teachingModeSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  subCategories: [{
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }],
  // 用於向後兼容的舊格式映射
  legacyMappings: [{
    oldValue: String,
    newValue: String
  }],
  // 排序權重
  sortOrder: {
    type: Number,
    default: 0
  },
  // 是否啟用
  isActive: {
    type: Boolean,
    default: true
  },
  // 創建和更新時間
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
teachingModeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 建立索引
teachingModeSchema.index({ value: 1 });
teachingModeSchema.index({ 'subCategories.value': 1 });
teachingModeSchema.index({ isActive: 1 });

module.exports = mongoose.model('TeachingMode', teachingModeSchema);
