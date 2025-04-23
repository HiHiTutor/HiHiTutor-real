const tutors = require('../data/tutors');

const getAllTutors = (req, res) => {
  res.json(tutors);
};

const getRecommendedTutors = (req, res) => {
  const recommended = tutors.filter(tutor => tutor.isRecommended);
  res.json(recommended);
};

module.exports = {
  getAllTutors,
  getRecommendedTutors
}; 