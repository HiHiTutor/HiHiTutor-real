const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'organization', 'tutor'],
    default: 'student'
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'active'  // student 默認 active，organization 默認 pending
  },
  organizationDocuments: {
    businessRegistration: String,  // 商業登記證
    addressProof: String          // 地址證明
  },
  tutorProfile: {
    education: String,
    experience: String,
    specialties: [String],
    documents: [String],
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
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

// 設置 organization 用戶的默認狀態為 pending
userSchema.pre('save', function(next) {
  if (this.isNew && this.userType === 'organization') {
    this.status = 'pending';
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 