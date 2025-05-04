const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getAllTutorCases, getRecommendedTutorCases } = require('../controllers/tutorCaseController');

// 讀取導師個案數據
const tutorCasesPath = path.join(__dirname, '../data/tutorCases.json');
let tutorCases = [];

try {
  const data = fs.readFileSync(tutorCasesPath, 'utf8');
  const parsedData = JSON.parse(data);
  tutorCases = Array.isArray(parsedData.cases) ? parsedData.cases : [];
  console.log('成功讀取導師個案數據，共', tutorCases.length, '筆');
} catch (error) {
  console.error('讀取導師個案數據失敗:', error);
  tutorCases = [];
}

// 生成測試數據
function generateTutorCases(count) {
  const categories = ['early-childhood', 'primary-secondary', 'tertiary', 'interest', 'adult'];
  const subCategories = {
    'early-childhood': [''],
    'primary-secondary': ['primary', 'secondary'],
    'tertiary': ['undergraduate', 'postgraduate'],
    'interest': [''],
    'adult': ['']
  };
  const subjects = {
    'early-childhood': ['early-childhood-chinese', 'early-childhood-english', 'early-childhood-math'],
    'primary': ['primary-chinese', 'primary-english', 'primary-math', 'primary-general', 'primary-stem'],
    'secondary': ['secondary-chinese', 'secondary-english', 'secondary-math', 'secondary-ls', 'secondary-humanities', 'secondary-economics', 'secondary-computer', 'secondary-dse', 'secondary-all'],
    'undergraduate': ['undergraduate-calculus', 'undergraduate-economics', 'undergraduate-statistics', 'undergraduate-accounting', 'undergraduate-programming', 'undergraduate-language'],
    'postgraduate': ['postgraduate-thesis', 'postgraduate-research', 'postgraduate-spss', 'postgraduate-presentation'],
    'interest': ['interest-music', 'interest-art', 'interest-programming', 'interest-language'],
    'adult': ['adult-business', 'adult-language', 'adult-workplace']
  };
  const regions = ['hong-kong-island', 'kowloon', 'new-territories', 'islands'];
  const subRegions = {
    'hong-kong-island': ['central-western', 'sai-ying-pun', 'shek-tong-tsui', 'wan-chai', 'admiralty', 'causeway-bay', 'happy-valley', 'tin-hau', 'tai-hang', 'north-point', 'fortress-hill', 'braemar-hill', 'quarry-bay', 'taikoo', 'sai-wan-ho', 'shau-kei-wan', 'heng-fa-chuen', 'chai-wan', 'siu-sai-wan', 'shek-o', 'aberdeen', 'ap-lei-chau', 'wong-chuk-hang', 'southern'],
    'kowloon': ['tsim-sha-tsui', 'jordan', 'yau-ma-tei', 'mong-kok', 'prince-edward', 'sham-shui-po', 'cheung-sha-wan', 'hung-hom', 'to-kwa-wan', 'ho-man-tin', 'kowloon-tong', 'san-po-kong', 'diamond-hill', 'lok-fu', 'tsz-wan-shan', 'ngau-tau-kok', 'lam-tin', 'kwun-tong', 'yau-tong', 'kowloon-city', 'wong-tai-sin'],
    'new-territories': ['tsuen-wan', 'kwai-chung', 'kwai-fong', 'tsing-yi', 'tuen-mun', 'yuen-long', 'tin-shui-wai', 'sheung-shui', 'fan-ling', 'tai-wo', 'tai-po', 'ma-on-shan', 'sha-tin', 'fo-tan', 'tseung-kwan-o', 'sai-kung', 'clear-water-bay', 'hang-hau', 'tiu-keng-leng', 'long-ping', 'kam-sheung-road', 'shek-mun'],
    'islands': ['tung-chung', 'sunny-bay', 'mui-wo', 'discovery-bay', 'cheung-chau', 'lamma-island', 'ping-chau', 'tai-o']
  };
  const modes = ['online', 'in-person'];
  const experiences = [
    '有多年教學經驗',
    '曾任職於知名教育機構',
    '具有豐富的補習經驗',
    '擅長因材施教',
    '有豐富的考試輔導經驗'
  ];

  const newCases = [];
  // 確保有 15 筆 featured 案例
  const featuredCount = 15;
  const featuredIndices = new Set();
  while (featuredIndices.size < featuredCount) {
    featuredIndices.add(Math.floor(Math.random() * count));
  }

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subCategory = subCategories[category][Math.floor(Math.random() * subCategories[category].length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const subRegion = subRegions[region][Math.floor(Math.random() * subRegions[region].length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const experience = experiences[Math.floor(Math.random() * experiences.length)];
    const budget = {
      min: Math.floor(Math.random() * 200) + 100,
      max: Math.floor(Math.random() * 300) + 300
    };

    // 隨機選擇 1-3 個科目
    const availableSubjects = subjects[subCategory || category];
    const subjectCount = Math.floor(Math.random() * 3) + 1;
    const selectedSubjects = [];
    for (let j = 0; j < subjectCount; j++) {
      const randomSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
      if (!selectedSubjects.includes(randomSubject)) {
        selectedSubjects.push(randomSubject);
      }
    }

    newCases.push({
      id: `case-${String(i + 1).padStart(3, '0')}`,
      category,
      subCategory,
      subjects: selectedSubjects,
      region,
      subRegion,
      mode,
      budget,
      experience,
      featured: featuredIndices.has(i),
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return newCases;
}

// 只在開發環境下生成測試數據
if (process.env.NODE_ENV === 'development' && tutorCases.length === 0) {
  tutorCases = generateTutorCases(120);
  // 移除自動寫入行為，避免 nodemon 無限重啟
  // fs.writeFileSync(tutorCasesPath, JSON.stringify({ cases: tutorCases }, null, 2));
  console.log('已生成測試數據，但未寫入文件以避免 nodemon 重啟');
}

// GET all tutor cases
router.get('/', getAllTutorCases);

// GET recommended tutor cases
router.get('/recommended', getRecommendedTutorCases);

// GET single tutor case
router.get('/:id', (req, res) => {
  try {
    const case_ = tutorCases.find(c => c.id === req.params.id);
    if (!case_) {
      return res.status(404).json({
        success: false,
        message: '找不到該導師個案'
      });
    }
    res.json({
      success: true,
      data: case_,
      message: '成功獲取導師個案'
    });
  } catch (error) {
    console.error('[❌] 處理單個導師個案請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案失敗'
    });
  }
});

module.exports = router; 