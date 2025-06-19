const mongoose = require('mongoose');

const uploadLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userNumber: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UploadLog', uploadLogSchema); 