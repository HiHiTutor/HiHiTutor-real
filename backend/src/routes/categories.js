const express = require('express');
const router = express.Router();

// 科目分類數據
const categories = [
  { "id": "C001", "name": "幼兒教育" },
  { "id": "C002", "name": "中小學教育" },
  { "id": "C003", "name": "興趣班" },
  { "id": "C004", "name": "大專補習課程" },
  { "id": "C005", "name": "成人教育" }
];

// GET all categories
router.get('/', (req, res) => {
  res.json([
    {
      id: "C001",
      name: "幼兒教育",
      icon: "🎈",
      subcategories: [
        { id: "SC001", name: "幼稚園K1" },
        { id: "SC002", name: "幼稚園K2" }
      ]
    },
    {
      id: "C002",
      name: "中小學教育",
      icon: "📚",
      subcategories: [
        { id: "SC003", name: "小學中文" },
        { id: "SC004", name: "小學英文" },
        { id: "SC005", name: "小學數學" }
      ]
    },
    {
      id: "C003",
      name: "興趣班",
      icon: "🎨",
      subcategories: [
        { id: "SC006", name: "畫畫班" },
        { id: "SC007", name: "音樂班" }
      ]
    },
    {
      id: "C004",
      name: "大專補習課程",
      icon: "🏫",
      subcategories: [
        { id: "SC008", name: "高數補習" },
        { id: "SC009", name: "經濟補習" }
      ]
    },
    {
      id: "C005",
      name: "成人教育",
      icon: "💼",
      subcategories: [
        { id: "SC010", name: "商業英文" },
        { id: "SC011", name: "管理學課程" }
      ]
    }
  ]);
});

module.exports = router; 