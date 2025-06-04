const express = require('express');
const router = express.Router();
const CATEGORY_OPTIONS = require('../constants/categoryOptions');

// 定義分類資料
const categories = [
  {
    id: 'preschool',
    name: '幼兒教育',
    subCategories: [
      {
        id: '',
        name: '幼兒教育',
        subjects: ['preschool-chinese', 'preschool-english', 'preschool-math']
      }
    ]
  },
  {
    id: 'primary-secondary',
    name: '中小學教育',
    subCategories: [
      {
        id: 'primary',
        name: '小學',
        subjects: ['primary-chinese', 'primary-english', 'primary-math']
      },
      {
        id: 'secondary',
        name: '中學',
        subjects: ['secondary-physics', 'secondary-chemistry', 'secondary-biology']
      }
    ]
  },
  {
    id: 'tertiary',
    name: '大專補習課程',
    subCategories: [
      {
        id: 'undergraduate',
        name: '大學本科',
        subjects: ['business', 'engineering', 'science', 'arts']
      },
      {
        id: 'postgraduate',
        name: '研究生',
        subjects: ['masters', 'phd', 'research']
      }
    ]
  },
  {
    id: 'interest',
    name: '興趣班',
    subCategories: [
      {
        id: '',
        name: '興趣班',
        subjects: ['music', 'piano', 'dance']
      }
    ]
  },
  {
    id: 'adult',
    name: '成人教育',
    subCategories: [
      {
        id: '',
        name: '成人教育',
        subjects: ['business-english', 'conversation', 'ielts']
      }
    ]
  }
];

// 獲取所有分類
router.get('/', (req, res) => {
  // 將 CATEGORY_OPTIONS 對象轉換為數組格式
  const categoriesArray = Object.entries(CATEGORY_OPTIONS).map(([value, category]) => ({
    value,
    label: category.label,
    subjects: category.subjects,
    subCategories: category.subCategories
  }));
  
  res.json(categoriesArray);
});

module.exports = router; 