const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 讀取學生個案數據
const studentCasesPath = path.join(__dirname, '../data/studentCases.json');
let studentCases = [];

try {
  const data = fs.readFileSync(studentCasesPath, 'utf8');
  const parsedData = JSON.parse(data);
  studentCases = Array.isArray(parsedData.cases) ? parsedData.cases : [];
  console.log('成功讀取學生個案數據，共', studentCases.length, '筆');
} catch (error) {
  console.error('讀取學生個案數據失敗:', error);
  studentCases = [];
}

// 生成測試數據
function generateStudentCases(count) {
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
if (process.env.NODE_ENV === 'development' && studentCases.length === 0) {
  studentCases = generateStudentCases(120);
  // 移除自動寫入行為，避免 nodemon 無限重啟
  // fs.writeFileSync(studentCasesPath, JSON.stringify({ cases: studentCases }, null, 2));
  console.log('已生成測試數據，但未寫入文件以避免 nodemon 重啟');
}

// 獲取學生個案列表
router.get('/', (req, res) => {
  try {
    console.log('收到獲取學生個案請求，查詢參數:', req.query);
    
    let filteredCases = [...studentCases];
    
    // 應用過濾條件
    if (req.query.category) {
      filteredCases = filteredCases.filter(c => c.category === req.query.category);
    }
    if (req.query.subCategory) {
      filteredCases = filteredCases.filter(c => c.subCategory === req.query.subCategory);
    }
    if (req.query.subjects) {
      const subjects = Array.isArray(req.query.subjects) ? req.query.subjects : [req.query.subjects];
      filteredCases = filteredCases.filter(c => subjects.includes(c.subjects));
    }
    if (req.query.region) {
      filteredCases = filteredCases.filter(c => c.region === req.query.region);
    }
    if (req.query.subRegion) {
      const subRegions = Array.isArray(req.query.subRegion) ? req.query.subRegion : [req.query.subRegion];
      filteredCases = filteredCases.filter(c => subRegions.includes(c.subRegion));
    }
    if (req.query.mode) {
      filteredCases = filteredCases.filter(c => c.mode === req.query.mode);
    }
    if (req.query.priceMin) {
      filteredCases = filteredCases.filter(c => c.budget >= parseInt(req.query.priceMin));
    }
    if (req.query.priceMax) {
      filteredCases = filteredCases.filter(c => c.budget <= parseInt(req.query.priceMax));
    }
    if (req.query.featured === 'true') {
      filteredCases = filteredCases.filter(c => c.featured === true);
    }

    // 分頁處理
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCases = filteredCases.slice(startIndex, endIndex);

    console.log('返回過濾後的學生個案數據，共', paginatedCases.length, '筆');
    
    res.json({
      cases: paginatedCases,
      total: filteredCases.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCases.length / limit)
    });
  } catch (error) {
    console.error('處理學生個案請求時出錯:', error);
    res.status(500).json({ error: '獲取學生個案失敗' });
  }
});

// 獲取推薦的學生個案
router.get('/recommended', (req, res) => {
  try {
    // 根據推薦邏輯排序
    const recommendedCases = studentCases
      .sort((a, b) => {
        // 計算每個個案的推薦分數
        const getScore = (case_) => {
          let score = 0;
          
          // 1. featured && pinned && 高評分
          if (case_.featured && case_.pinned && case_.rating >= 4.5) {
            score += 1000;
          }
          // 2. featured && 高評分
          else if (case_.featured && case_.rating >= 4.5) {
            score += 800;
          }
          // 3. pinned && 高評分
          else if (case_.pinned && case_.rating >= 4.5) {
            score += 600;
          }
          // 4. featured
          else if (case_.featured) {
            score += 400;
          }
          // 5. pinned
          else if (case_.pinned) {
            score += 200;
          }
          // 6. 高評分
          else if (case_.rating >= 4.5) {
            score += 100;
          }
          
          // 加上評分作為次要排序條件
          score += case_.rating || 0;
          
          return score;
        };

        const scoreA = getScore(a);
        const scoreB = getScore(b);
        return scoreB - scoreA;
      })
      .slice(0, 8); // 只返回前 8 個個案

    res.json({
      success: true,
      cases: recommendedCases
    });
  } catch (error) {
    console.error('Error getting recommended cases:', error);
    res.status(500).json({
      success: false,
      error: '獲取推薦個案時發生錯誤'
    });
  }
});

// 獲取單個學生個案
router.get('/:id', (req, res) => {
  try {
    const case_ = studentCases.find(c => c.id === req.params.id);
    if (!case_) {
      return res.status(404).json({ error: '找不到該學生個案' });
    }
    res.json(case_);
  } catch (error) {
    console.error('處理單個學生個案請求時出錯:', error);
    res.status(500).json({ error: '獲取學生個案失敗' });
  }
});

module.exports = router; 