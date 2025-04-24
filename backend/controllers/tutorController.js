const tutors = require('../data/tutors');

// 回傳所有導師
const getAllTutors = (req, res) => {
  res.json(tutors);
};

// 回傳精選導師
const getRecommendedTutors = (req, res) => {
  // 根據 VIP、置頂和評分排序
  const recommendedTutors = tutors
    .sort((a, b) => {
      const scoreA = (a.isVip ? 1000 : 0) + (a.isTop ? 100 : 0) + a.rating;
      const scoreB = (b.isVip ? 1000 : 0) + (b.isTop ? 100 : 0) + b.rating;
      return scoreB - scoreA;
    })
    .slice(0, 8);
  res.json(recommendedTutors);
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