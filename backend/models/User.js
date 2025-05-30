const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'banned'],
    default: 'active'
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// 設置 organization 用戶的默認狀態為 pending
userSchema.pre('save', function(next) {
  if (this.isNew && this.userType === 'organization') {
    this.status = 'pending';
  }
  // 確保管理員用戶總是 active
  if (this.userType === 'admin') {
    this.status = 'active';
    this.role = 'admin';
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 