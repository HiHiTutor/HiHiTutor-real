const fs = require('fs');
const path = require('path');

const tutorCasesPath = path.join(__dirname, '..', 'data', 'tutorCases.json');

// 載入導師個案數據
const loadTutorCases = () => {
  try {
    const data = fs.readFileSync(tutorCasesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('讀取 tutorCases 失敗:', error);
    return [];
  }
};

module.exports = {
  loadTutorCases
}; 