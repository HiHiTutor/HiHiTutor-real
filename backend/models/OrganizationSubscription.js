const mongoose = require('mongoose');

const organizationSubscriptionSchema = new mongoose.Schema({
  // 關聯到機構用戶
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 訂閱計劃
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  
  // 收費配置
  pricing: {
    baseMonthlyFee: {
      type: Number,
      default: 200 // HKD 200/月
    },
    includedTutors: {
      type: Number,
      default: 5 // 包含5個導師
    },
    additionalTutorFee: {
      type: Number,
      default: 50 // HKD 50/月/個額外導師
    }
  },
  
  // 當前狀態
  currentTutors: {
    type: Number,
    default: 0
  },
  
  // 訂閱狀態
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  // 訂閱週期
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  
  // 當前週期
  currentPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  // 下一個週期
  nextPeriod: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  
  // 付款信息
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal'],
      default: 'credit_card'
    },
    lastPaymentDate: {
      type: Date
    },
    nextPaymentDate: {
      type: Date
    },
    amount: {
      type: Number,
      default: 200
    }
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

// 計算當前月費
organizationSubscriptionSchema.methods.calculateMonthlyFee = function() {
  const baseFee = this.pricing.baseMonthlyFee;
  const includedTutors = this.pricing.includedTutors;
  const additionalTutorFee = this.pricing.additionalTutorFee;
  const currentTutors = this.currentTutors;
  
  if (currentTutors <= includedTutors) {
    return baseFee;
  } else {
    const additionalTutors = currentTutors - includedTutors;
    return baseFee + (additionalTutors * additionalTutorFee);
  }
};

// 檢查是否可以添加更多導師
organizationSubscriptionSchema.methods.canAddTutor = function() {
  // 基本檢查：狀態必須是活躍的
  if (this.status !== 'active') {
    return false;
  }
  
  // 檢查是否在當前週期內
  const now = new Date();
  if (now < this.currentPeriod.startDate || now > this.currentPeriod.endDate) {
    return false;
  }
  
  return true; // 可以添加，但需要額外收費
};

// 更新時自動更新 updatedAt
organizationSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('OrganizationSubscription', organizationSubscriptionSchema); 