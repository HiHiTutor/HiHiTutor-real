const categories = require('../data/categories');

// 獲取所有課程分類
const getAllCategories = (req, res) => {
  res.json(categories);
};

module.exports = {
  getAllCategories
}; 