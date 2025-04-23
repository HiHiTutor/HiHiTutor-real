const hotSubjects = require('../data/hotSubjects');

// 獲取熱門科目統計資料
const getHotSubjects = (req, res) => {
  res.json(hotSubjects);
};

module.exports = {
  getHotSubjects
}; 