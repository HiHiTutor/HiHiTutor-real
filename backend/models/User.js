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
  // 如果密碼沒有被修改且不是新文檔，跳過
  if (!this.isModified('password') && !this.isNew) {
    return next();
  }
  try {
    console.log('🔐 正在加密密碼...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ 密碼加密完成');
    next();
  } catch (error) {
    console.error('❌ 密碼加密失敗:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 正在比對密碼...', {
      candidatePasswordLength: candidatePassword.length,
      hashedPasswordLength: this.password.length,
      hashedPasswordStart: this.password.substring(0, 10) + '...'
    });
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('✅ 密碼比對結果:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ 密碼比對失敗:', error);
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