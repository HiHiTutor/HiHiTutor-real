const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sms', 'email'],
    default: 'sms'
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset', 'phone_verification'],
    default: 'phone_verification'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10分鐘後自動刪除文檔
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  }
});

// 索引優化
verificationCodeSchema.index({ phoneNumber: 1, createdAt: -1 });
verificationCodeSchema.index({ phoneNumber: 1, isUsed: 1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 檢查驗證碼是否有效
verificationCodeSchema.methods.isValid = function() {
  return !this.isUsed && 
         this.attempts < this.maxAttempts && 
         new Date() < this.expiresAt;
};

// 標記為已使用
verificationCodeSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// 增加嘗試次數
verificationCodeSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// 靜態方法：創建新的驗證碼
verificationCodeSchema.statics.createCode = async function(phoneNumber, code, purpose = 'phone_verification', type = 'sms') {
  // 將舊的驗證碼標記為已使用
  await this.updateMany(
    { 
      phoneNumber, 
      purpose, 
      isUsed: false 
    },
    { 
      isUsed: true 
    }
  );

  // 創建新的驗證碼
  const verificationCode = new this({
    phoneNumber,
    code,
    type,
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10分鐘後過期
  });

  return verificationCode.save();
};

// 靜態方法：驗證驗證碼
verificationCodeSchema.statics.verifyCode = async function(phoneNumber, code, purpose = 'phone_verification') {
  const verificationCode = await this.findOne({
    phoneNumber,
    code,
    purpose,
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!verificationCode) {
    return { valid: false, reason: 'Code not found' };
  }

  if (!verificationCode.isValid()) {
    await verificationCode.incrementAttempts();
    return { valid: false, reason: 'Code expired or max attempts reached' };
  }

  // 標記為已使用
  await verificationCode.markAsUsed();
  
  return { valid: true, verificationCode };
};

module.exports = mongoose.model('VerificationCode', verificationCodeSchema); 