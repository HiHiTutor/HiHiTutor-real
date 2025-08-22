const mongoose = require('mongoose');

const tutorCaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'closed', 'pending'],
    default: 'open'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  mode: {
    type: String,
    required: true
  },
  modes: {
    type: [String],
    required: true
  },
  lessonDetails: {
    duration: {
      type: Number,
      required: true,
      min: 30,
      max: 180,
      validate: {
        validator: function(v) {
          return v % 30 === 0;
        },
        message: '課堂時長必須是30分鐘的倍數'
      }
    },
    pricePerLesson: {
      type: Number,
      required: true,
      min: 0
    },
    lessonsPerWeek: {
      type: Number,
      required: true,
      min: 1
    }
  },
  experience: {
    type: String,
    enum: ['無教學經驗要求', '1-3年教學經驗', '3-5年教學經驗', '5年以上教學經驗'],
    default: '無教學經驗要求'
  },
  featured: {
    type: Boolean,
    default: false
  },
  posterId: {
    type: String,
    required: false,
    description: '发布者ID'
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// 添加虛擬字段
tutorCaseSchema.virtual('type').get(function() {
  return 'tutor';
});

module.exports = mongoose.model('TutorCase', tutorCaseSchema); 