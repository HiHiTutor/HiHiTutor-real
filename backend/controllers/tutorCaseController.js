const tutorCases = require('../data/tutorCases');

// 獲取所有導師個案
const getAllTutorCases = (req, res) => {
  res.json(tutorCases);
};

module.exports = {
  getAllTutorCases
}; 