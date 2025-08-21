const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  }
});

const SubCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  subjects: [SubjectSchema]
});

const CategorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  subjects: [SubjectSchema],
  subCategories: [SubCategorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新時自動設置 updatedAt
CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
