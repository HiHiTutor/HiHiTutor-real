const tutors = require('../data/tutors');

// 回傳所有導師
const getAllTutors = (req, res) => {
  res.json(tutors);
};

// 回傳精選導師
const getRecommendedTutors = (req, res) => {
  const recommended = tutors.filter(tutor => tutor.isRecommended);
  res.json(recommended);
};

// 根據 ID 回傳特定導師
const getTutorById = (req, res) => {
  const id = parseInt(req.params.id);
  const tutor = tutors.find(tutor => tutor.id === id);
  
  if (!tutor) {
    return res.status(404).json({ error: '找不到該導師' });
  }
  
  res.json(tutor);
};

module.exports = {
  getAllTutors,
  getRecommendedTutors,
  getTutorById
}; 