const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// 創建索引以提高查詢性能
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ authorId: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ featured: 1, status: 1 });

// 虛擬字段：格式化日期
articleSchema.virtual('formattedDate').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString('zh-HK') : '';
});

// 虛擬字段：格式化時間
articleSchema.virtual('formattedTime').get(function() {
  return this.createdAt ? this.createdAt.toLocaleTimeString('zh-HK') : '';
});

module.exports = mongoose.model('Article', articleSchema);
