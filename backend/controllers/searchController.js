const tutors = require('../data/tutors') || [];
const cases = require('../data/cases') || [];

// 搜尋導師與個案
const search = (req, res) => {
  const query = req.query.q;
  
  // 如果沒有提供關鍵字，回傳全部資料
  if (!query) {
    return res.json({
      tutors: tutors || [],
      cases: cases || []
    });
  }
  
  // 搜尋導師
  const matchedTutors = (tutors || []).filter(tutor => {
    if (!tutor) return false;
    
    return (
      (tutor.name && tutor.name.includes(query)) ||
      (tutor.subject && tutor.subject.includes(query)) ||
      (tutor.experience && tutor.experience.includes(query)) ||
      (Array.isArray(tutor.tags) && tutor.tags.some(tag => tag && tag.includes(query)))
    );
  });
  
  // 搜尋個案
  const matchedCases = (cases || []).filter(caseItem => {
    if (!caseItem) return false;
    
    return (
      (caseItem.subject && caseItem.subject.includes(query)) ||
      (caseItem.location && caseItem.location.includes(query)) ||
      (caseItem.description && caseItem.description.includes(query)) ||
      (Array.isArray(caseItem.tags) && caseItem.tags.some(tag => tag && tag.includes(query)))
    );
  });
  
  res.json({
    tutors: matchedTutors,
    cases: matchedCases
  });
};

module.exports = {
  search
}; 