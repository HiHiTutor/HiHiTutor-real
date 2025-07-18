const express = require('express');
const fs = require('fs');
const path = require('path');
const { getAllStudentCases, createStudentCase, getStudentCaseById } = require('../controllers/studentCaseController');

const studentCasesData = fs.readFileSync(path.resolve(__dirname, '../data/studentCases.json'));
const tutorCasesData = fs.readFileSync(path.resolve(__dirname, '../data/tutorCases.json'));

const studentCases = JSON.parse(studentCasesData);
const tutorCases = JSON.parse(tutorCasesData);

// 定義有效的子分類選項
const VALID_SUB_CATEGORIES = [
  '小學學科',
  '中學學科',
  '數學',
  '英文',
  '中文',
  '物理',
  '化學',
  '生物',
  '通識',
  '歷史',
  '地理',
  '經濟',
  '倫理與宗教',
  '科學',
  '數學延伸',
  '英文會話',
  '中文寫作',
  '英文寫作',
  'DSE',
  '音樂',
  '鋼琴',
  '藝術',
  '視覺藝術',
  '設計',
  '科技',
  '體育',
  '家政',
  '會計',
  '商業學',
  '資訊科技',
  '旅遊',
  '款待'
];

const router = express.Router();

// GET all student cases
router.get('/', getAllStudentCases);

// GET single student case
router.get('/:id', getStudentCaseById);

// 學生出Post搵導師
router.get('/find-tutor-cases', async (req, res) => {
  try {
    const { category, subCategory, region, priceMin, priceMax, featured, limit, page } = req.query;
    
    // 使用數據庫查詢而不是靜態數據
    const StudentCase = require('../../models/StudentCase');
    
    // 構建查詢條件
    const query = {};
    
    // 如果是獲取推薦案例，只顯示已審批的
    if (featured === 'true') {
      query.isApproved = true;
      query.featured = true;
    } else {
      // 顯示所有已審批的案例
      query.isApproved = true;
    }

    // 分類篩選
    if (category) {
      query.category = category;
    }

    // 子分類篩選
    if (subCategory) {
      const subArr = Array.isArray(subCategory) ? subCategory : subCategory.split(',');
      query.subCategory = { $in: subArr };
    }

    // 地區篩選
    if (region) {
      const regionArr = Array.isArray(region) ? region : region.split(',');
      query.regions = { $in: regionArr };
    }

    // 價格範圍篩選
    if (priceMin || priceMax) {
      query.budget = {};
      if (priceMin) query.budget.$gte = Number(priceMin);
      if (priceMax) query.budget.$lte = Number(priceMax);
    }

    // 執行查詢
    const cases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20);

    // 獲取總數
    const totalCount = await StudentCase.countDocuments(query);

    res.json({
      success: true,
      data: {
        cases: cases,
        totalCount: cases.length,
        allDocumentsCount: totalCount
      }
    });
  } catch (error) {
    console.error('❌ Error in /find-tutor-cases:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 導師出Post搵學生
router.get('/find-student-cases', (req, res) => {
  const { category, subCategory, region, priceMin, priceMax, featured, limit, page } = req.query;
  let filtered = Array.isArray(studentCases) ? studentCases : [];

  console.log("🔍 後端收到搜尋參數：", {
    category,
    subCategory,
    region,
    priceMin,
    priceMax,
    featured,
    limit,
    page
  });

  // 如果請求精選個案
  if (featured === 'true') {
    filtered = filtered.filter(item => item.featured === true);
  }

  // 處理分類篩選
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }

  // 處理子分類篩選
  if (subCategory) {
    const subArr = Array.isArray(subCategory) ? subCategory : subCategory.split(',');
    console.log("🔍 子分類搜尋參數：", subArr);
    filtered = filtered.filter(item => {
      console.log("🧪 subCategory 比對：", item.subCategory);
      return subArr.some(sub => {
        if (Array.isArray(item.subCategory)) {
          return item.subCategory.includes(sub); // 比對 array 內有冇 sub
        } else if (typeof item.subCategory === 'string') {
          return item.subCategory.includes(sub); // 比對 string 包唔包含 sub
        }
        return false;
      });
    });
  }

  // 處理地區篩選
  if (region) {
    const regionArr = Array.isArray(region) ? region : region.split(',');
    filtered = filtered.filter(item => regionArr.some(r => item.region?.includes(r)));
  }

  // 處理價格範圍篩選
  if (priceMin || priceMax) {
    filtered = filtered.filter(item => {
      if (!item.budget) return false;
      const price = Number(item.budget.replace(/[^0-9]/g, ''));
      const minVal = priceMin ? Number(priceMin) : 0;
      const maxVal = priceMax ? Number(priceMax) : 10000;
      return price >= minVal && price <= maxVal;
    });
  }

  // 如果有 date 欄位，按 date 由新到舊排序
  if (filtered.length > 0 && filtered[0].date) {
    filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 處理分頁
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedCases = filtered.slice(startIndex, endIndex);

  console.log("📦 後端回傳資料：", {
    total: filtered.length,
    filtered: paginatedCases.length,
    page: pageNum,
    limit: limitNum
  });

  res.json(paginatedCases);
});

// 單一導師個案詳情
router.get('/find-student-cases/:id', (req, res) => {
  const found = Array.isArray(studentCases) ? studentCases.find(item => item.id === req.params.id) : null;
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ message: '個案未找到' });
  }
});

// 單一學生個案詳情
router.get('/find-tutor-cases/:id', async (req, res) => {
  try {
    const StudentCase = require('../../models/StudentCase');
    const { id } = req.params;
    
    let caseItem = null;
    
    // 嘗試使用 ObjectId 查找
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      caseItem = await StudentCase.findById(id);
    }
    
    // 如果通過 _id 找不到，嘗試通過 id 字段查找
    if (!caseItem) {
      caseItem = await StudentCase.findOne({ id: id });
    }
    
    if (caseItem) {
      res.json({
        success: true,
        data: caseItem
      });
    } else {
      res.status(404).json({
        success: false,
        message: '找不到該學生個案'
      });
    }
  } catch (error) {
    console.error('❌ Error in /find-tutor-cases/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 精選導師個案（List）
router.get('/recommended-tutor-cases', (req, res) => {
  let filtered = Array.isArray(studentCases) ? studentCases.filter(item => item.isRecommended === true) : [];
  // 如果有 date 欄位，按 date 由新到舊排序
  if (filtered.length > 0 && filtered[0].date) {
    filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  res.json(filtered);
});

// 學生出Post（POST /api/find-tutor-cases）
const postStudentCaseHandler = (req, res) => {
  try {
    const filePath = path.resolve(__dirname, '../data/studentCases.json');
    const cases = JSON.parse(fs.readFileSync(filePath));
    const newCase = { ...req.body, id: `S${Date.now()}` };
    cases.unshift(newCase);
    fs.writeFileSync(filePath, JSON.stringify(cases, null, 2));
    res.json({ success: true, data: newCase });
  } catch (error) {
    res.status(500).json({ success: false, message: '新增學生個案失敗' });
  }
};
router.post('/', postStudentCaseHandler);
router.post('/find-tutor-cases', postStudentCaseHandler);

// 導師出Post（POST /api/find-student-cases）
// 這段要放在另一個 router 實例，或用條件判斷路徑

module.exports = router; 