const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true
  },
  tutorId: {
    type: String,
    default: null, // 僅適用於 userType 為 'tutor'
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email 格式不正確'
    }
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v);
      },
      message: '請輸入8位數字電話'
    }
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'tutor', 'organization'],
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: '/avatars/default.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'pending'],
    default: 'active'
  },
  refreshToken: {
    type: String,
    default: null, // 預留欄位，支援登入延伸
  },
  organizationProfile: {
    orgId: {
      type: String,
      default: null
    },
    documents: [
      {
        type: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        }
      }
    ]
  },
  organizationDocuments: {
    businessRegistration: {
      type: String,
      default: null
    },
    addressProof: {
      type: String,
      default: null
    }
  },
  tutorProfile: {
    displayPublic: {
      type: Boolean,
      default: false
    },
    gender: {
      type: String,
      enum: ['male', 'female']
    },
    birthDate: {
      type: Date
    },
    teachingExperienceYears: {
      type: Number,
      default: 0
    },
    educationLevel: {
      type: String
    },
    subjects: {
      type: [String],
      required: function () {
        return this.userType === 'tutor';
      },
      validate: {
        validator: function (arr) {
          if (this.userType !== 'tutor') {
            return true;
          }
          return Array.isArray(arr) && arr.length > 0;
        },
        message: '請至少填寫一個可教授科目'
      }
    },
    examResults: [{
      subject: {
        type: String
      },
      grade: {
        type: String
      }
    }],
    teachingAreas: [{
      type: String
    }],
    availableTime: [{
      day: {
        type: String
      },
      time: {
        type: String
      }
    }],
    teachingMethods: [{
      type: String
    }],
    classType: [{
      type: String
    }],
    sessionRate: {
      type: Number,
      required: function () {
        return this.userType === 'tutor';
      },
      validate: {
        validator: function(v) {
          if (this.userType !== 'tutor') {
            return true;
          }
          return v >= 100;
        },
        message: '堂費不能少於 100 元'
      }
    },
    introduction: {
      type: String
    },
    courseFeatures: {
      type: String
    },
    documents: [{
      type: {
        type: String
      },
      url: {
        type: String
      }
    }],
    avatarUrl: {
      type: String
    },
    applicationStatus: {
      type: String,
      enum: ['notApplied', 'pending', 'approved', 'rejected'],
      default: 'notApplied'
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  isTop: {
    type: Boolean,
    default: false
  },
  isVip: {
    type: Boolean,
    default: false
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  profileStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  remarks: {
    type: String,
    default: ''
  },
  documents: {
    idCard: {
      type: String,
      default: null
    },
    educationCert: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// 密碼加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 驗證密碼
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// 設置管理員用戶的默認狀態
userSchema.pre('save', function(next) {
  // 確保管理員用戶總是 active
  if (this.role === 'admin') {
    this.status = 'active';
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 