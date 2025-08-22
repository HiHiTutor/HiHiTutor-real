const mongoose = require('mongoose');

const studentCaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  tutorId: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false
  },
  subjects: {
    type: [String],
    required: false
  },
  location: {
    type: String,
    required: false
  },
  budget: {
    type: String,
    required: false,
    default: ''
  },
  mode: {
    type: String,
    required: false,
    enum: ['面對面', '線上', 'both', '網課', '面授', 'offline', 'online', 'in-person'],
    default: '線上'
  },
  modes: {
    type: [String],
    required: false
  },
  requirement: {
    type: String,
    required: false
  },
  requirements: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false,
    default: ''
  },
  subCategory: {
    type: String,
    required: false
  },
  region: {
    type: [String],
    required: false
  },
  regions: {
    type: [String],
    required: false
  },
  subRegions: {
    type: [String],
    required: false
  },
  priceRange: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: false,
    default: 60
  },
  durationUnit: {
    type: String,
    required: false,
    default: 'minutes'
  },
  weeklyLessons: {
    type: Number,
    required: false,
    default: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  // VIP 相關字段
  isVip: {
    type: Boolean,
    default: false
  },
  vipLevel: {
    type: Number,
    default: 0, // 0: 普通, 1: VIP, 2: 超級VIP
    min: 0,
    max: 2
  },
  // 置頂相關字段
  isTop: {
    type: Boolean,
    default: false
  },
  topLevel: {
    type: Number,
    default: 0, // 0: 普通, 1: 置頂, 2: 超級置頂
    min: 0,
    max: 2
  },
  // 評分相關字段
  ratingScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // 付費相關字段
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentType: {
    type: String,
    enum: ['free', 'basic', 'premium', 'vip'],
    default: 'free'
  },
  // 推廣相關字段
  promotionLevel: {
    type: Number,
    default: 0, // 0: 無推廣, 1-5: 推廣等級
    min: 0,
    max: 5
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'in_progress'],
    default: 'open'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userID: {
    type: String,
    required: false,
    description: '用户ID'
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

// 更新 updatedAt 欄位
studentCaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StudentCase', studentCaseSchema); 