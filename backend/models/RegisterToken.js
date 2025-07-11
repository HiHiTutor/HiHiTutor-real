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
    required: false
  },
  email: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['verification', 'password-reset'],
    default: 'verification'
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
    default: Date.now
  }
});

// 自動刪除過期的 token
registerTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RegisterToken', registerTokenSchema); 