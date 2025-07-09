const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ResetToken', resetTokenSchema); 