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
  },
  userId: {
    type: String,
    unique: true,
    sparse: true
  },
  tutorId: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // 如果密碼被修改或是新文檔，則進行加密
  if (this.isModified('password') || this.isNew) {
    try {
      console.log('🔐 正在加密密碼...', {
        isNew: this.isNew,
        isModified: this.isModified('password'),
        originalPassword: this.password
      });
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log('✅ 密碼加密完成', {
        hashedPassword: this.password
      });
      next();
    } catch (error) {
      console.error('❌ 密碼加密失敗:', error);
      next(error);
    }
  } else {
    next();
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 開始密碼比對...', {
      candidatePassword,
      candidatePasswordLength: candidatePassword.length,
      hashedPassword: this.password,
      hashedPasswordLength: this.password.length
    });

    // 直接比對原始密碼（用於調試）
    const directMatch = candidatePassword === this.password;
    console.log('🔍 直接比對結果:', directMatch);

    // 使用 bcrypt 比對
    const bcryptMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔍 bcrypt 比對結果:', bcryptMatch);

    // 生成測試哈希（用於調試）
    const testHash = await bcrypt.hash(candidatePassword, 10);
    console.log('🔍 測試哈希:', {
      testHash,
      testHashLength: testHash.length,
      originalHash: this.password,
      originalHashLength: this.password.length
    });

    return bcryptMatch;
  } catch (error) {
    console.error('❌ 密碼比對過程中發生錯誤:', error);
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