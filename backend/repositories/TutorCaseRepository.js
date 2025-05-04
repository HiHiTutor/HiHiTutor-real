const fs = require('fs');
const path = require('path');

const tutorCasesFile = path.join(__dirname, '../data/tutorCases.json');

class TutorCaseRepository {
  constructor() {
    this.ensureTutorCasesFile();
  }

  // 確保 tutorCases.json 檔案存在
  ensureTutorCasesFile() {
    if (!fs.existsSync(tutorCasesFile)) {
      fs.writeFileSync(tutorCasesFile, JSON.stringify({ cases: [] }, null, 2));
    }
  }

  // 載入所有導師案例
  getAllTutorCases() {
    try {
      const data = fs.readFileSync(tutorCasesFile, 'utf8');
      const jsonData = JSON.parse(data);
      return Array.isArray(jsonData.cases) ? jsonData.cases : [];
    } catch (error) {
      console.error('[❌] 載入導師案例失敗:', error);
      return [];
    }
  }

  // 根據 ID 取得導師案例
  getTutorCaseById(id) {
    const cases = this.getAllTutorCases();
    return cases.find(case_ => case_.id === id);
  }

  // 取得特色導師案例
  getFeaturedTutorCases(limit = 8) {
    const cases = this.getAllTutorCases();
    return cases
      .filter(case_ => case_.featured)
      .slice(0, limit);
  }

  // 儲存導師案例
  saveTutorCases(cases) {
    try {
      const data = { cases };
      fs.writeFileSync(tutorCasesFile, JSON.stringify(data, null, 2));
      console.log('[✅] 導師案例已儲存');
      return true;
    } catch (error) {
      console.error('[❌] 儲存導師案例失敗:', error);
      return false;
    }
  }
}

module.exports = new TutorCaseRepository(); 