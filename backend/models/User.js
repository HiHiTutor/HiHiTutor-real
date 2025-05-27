const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// 密碼加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 驗證密碼
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 設置 organization 用戶的默認狀態為 pending
userSchema.pre('save', function(next) {
  if (this.isNew && this.userType === 'organization') {
    this.status = 'pending';
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 