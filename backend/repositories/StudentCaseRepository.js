const fs = require('fs');
const path = require('path');

const studentCasesFile = path.join(__dirname, '../data/studentCases.json');

class StudentCaseRepository {
  constructor() {
    this.ensureStudentCasesFile();
  }

  // 確保 studentCases.json 檔案存在
  ensureStudentCasesFile() {
    if (!fs.existsSync(studentCasesFile)) {
      fs.writeFileSync(studentCasesFile, JSON.stringify({ cases: [] }, null, 2));
    }
  }

  // 載入所有學生案例
  getAllStudentCases() {
    try {
      const data = fs.readFileSync(studentCasesFile, 'utf8');
      const jsonData = JSON.parse(data);
      return Array.isArray(jsonData.cases) ? jsonData.cases : [];
    } catch (error) {
      console.error('[❌] 載入學生案例失敗:', error);
      return [];
    }
  }

  // 根據 ID 取得學生案例
  getStudentCaseById(id) {
    const cases = this.getAllStudentCases();
    return cases.find(case_ => case_.id === id);
  }

  // 取得特色學生案例
  getFeaturedStudentCases(limit = 8) {
    const cases = this.getAllStudentCases();
    return cases
      .filter(case_ => case_.featured)
      .slice(0, limit);
  }

  // 儲存學生案例
  saveStudentCases(cases) {
    try {
      const data = { cases };
      fs.writeFileSync(studentCasesFile, JSON.stringify(data, null, 2));
      console.log('[✅] 學生案例已儲存');
      return true;
    } catch (error) {
      console.error('[❌] 儲存學生案例失敗:', error);
      return false;
    }
  }
}

module.exports = new StudentCaseRepository(); 