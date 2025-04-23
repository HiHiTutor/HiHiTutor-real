const categories = require('../data/categories');

// 獲取所有分類
const getAllCategories = (req, res) => {
  res.json(categories);
};

// 獲取單個分類
const getCategoryById = (req, res) => {
  const categoryId = parseInt(req.params.id);
  const category = findCategoryById(categories, categoryId);
  
  if (!category) {
    return res.status(404).json({ error: '找不到此分類' });
  }
  
  res.json(category);
};

// 遞迴查找分類
const findCategoryById = (categories, id) => {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.subcategories) {
      const found = findCategoryById(category.subcategories, id);
      if (found) return found;
    }
  }
  return null;
};

module.exports = {
  getAllCategories,
  getCategoryById
}; 