const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/studentCases.json');

function loadStudentCases() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('❌ JSON parse error in studentCases.json:', e);
    return [];
  }
}

function saveStudentCases(cases) {
  fs.writeFileSync(filePath, JSON.stringify(cases, null, 2));
}

module.exports = { loadStudentCases, saveStudentCases }; 