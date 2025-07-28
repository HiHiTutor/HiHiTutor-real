const mongoose = require('mongoose');

const organizationTutorSchema = new mongoose.Schema({
  // 關聯到機構用戶
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 導師基本信息
  tutorName: {
    type: String,
    required: true
  },
  
  tutorEmail: {
    type: String,
    required: true
  },
  
  tutorPhone: {
    type: String,
    required: true
  },
  
  // 導師CV信息
  cv: {
    // 基本信息
    gender: {
      type: String,
      enum: ['male', 'female']
    },
    
    birthDate: {
      type: Date
    },
    
    educationLevel: {
      type: String
    },
    
    teachingExperienceYears: {
      type: Number,
      default: 0
    },
    
    // 教學信息
    subjects: {
      type: [String],
      required: true,
      validate: {
        validator: function(arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: '請至少填寫一個可教授科目'
      }
    },
    
    teachingAreas: [{
      type: String
    }],
    
    teachingMethods: [{
      type: String
    }],
    
    sessionRate: {
      type: Number,
      default: 100,
      min: 50
    },
    
    // 詳細信息
    introduction: {
      type: String
    },
    
    qualifications: [{
      type: String
    }],
    
    examResults: [{
      subject: {
        type: String
      },
      grade: {
        type: String
      }
    }],
    
    // 可用時間
    availableTime: [{
      day: {
        type: String
      },
      time: {
        type: String
      }
    }],
    
    // 頭像
    avatar: {
      type: String,
      default: '/avatars/default.png'
    },
    
    // 證書文件
    documents: {
      idCard: {
        type: String
      },
      educationCert: [{
        type: String
      }]
    }
  },
  
  // 狀態管理
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  
  // 公開顯示
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // 排序
  order: {
    type: Number,
    default: 0
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
}, {
  timestamps: true
});

// 更新時自動更新 updatedAt
organizationTutorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('OrganizationTutor', organizationTutorSchema); 