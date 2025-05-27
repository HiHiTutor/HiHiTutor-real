const mongoose = require('mongoose');

const registerTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 分鐘後自動刪除
  }
});

// 創建索引以加速查詢
registerTokenSchema.index({ phone: 1, code: 1 });
registerTokenSchema.index({ token: 1 });
registerTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RegisterToken = mongoose.model('RegisterToken', registerTokenSchema);

module.exports = RegisterToken; 