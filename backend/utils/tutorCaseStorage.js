const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/tutorCases.json');

function loadTutorCases() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

function saveTutorCases(cases) {
  fs.writeFileSync(filePath, JSON.stringify(cases, null, 2));
}

module.exports = { loadTutorCases, saveTutorCases }; 