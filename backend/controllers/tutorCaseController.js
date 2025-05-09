const fs = require('fs');
const path = require('path');
const tutorCaseRepository = require('../repositories/TutorCaseRepository');
const { loadTutorCases, saveTutorCases } = require('../utils/tutorCaseStorage');

// 讀取導師案例數據
let tutorCases = [];
try {
  const data = fs.readFileSync(path.join(__dirname, '../data/tutorCases.json'), 'utf8');
  const jsonData = JSON.parse(data);
  tutorCases = Array.isArray(jsonData.cases) ? jsonData.cases : [];
} catch (error) {
  console.error('Error reading tutor cases:', error);
  tutorCases = [];
}

// 獲取所有導師案例
const getAllTutorCases = (req, res) => {
  try {
    const allCases = loadTutorCases();
    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取導師案例列表'
    });
  } catch (error) {
    console.error('[❌] 獲取導師案例時出錯:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取導師案例時發生錯誤' 
    });
  }
};

// 創建新導師案例
const createTutorCase = (req, res) => {
  try {
    const newCase = {
      id: `T${Date.now()}`,
      tutorId: req.user?.id || req.body.tutorId || 'unknown',
      title: req.body.title || '',
      description: req.body.description || '',
      category: req.body.category || '',
      subCategory: req.body.subCategory || '',
      subjects: req.body.subjects || [],
      regions: req.body.regions || [],
      subRegions: req.body.subRegions || [],
      modes: req.body.modes || [],
      price: req.body.price || '',
      location: req.body.location || '',
      lessonDuration: req.body.lessonDuration || '',
      durationUnit: req.body.durationUnit || '',
      weeklyLessons: req.body.weeklyLessons || '',
      experience: req.body.experience || '',
      featured: req.body.featured || false,
      createdAt: new Date().toISOString()
    };
    
    const allCases = loadTutorCases();
    allCases.unshift(newCase);
    saveTutorCases(allCases);
    
    res.status(201).json({
      success: true,
      data: newCase,
      message: '成功創建導師案例'
    });
  } catch (error) {
    console.error('[❌] 創建導師案例時出錯:', error);
    res.status(500).json({
      success: false,
      message: '創建導師案例失敗'
    });
  }
};

// 獲取單個導師案例
const getTutorCaseById = (req, res) => {
  try {
    const case_ = tutorCaseRepository.getTutorCaseById(req.params.id);
    if (!case_) {
      return res.status(404).json({
        success: false,
        message: '找不到該導師個案'
      });
    }
    res.json({
      success: true,
      data: case_,
      message: '成功獲取導師個案'
    });
  } catch (error) {
    console.error('[❌] 處理單個導師個案請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案失敗'
    });
  }
};

module.exports = {
  getAllTutorCases,
  createTutorCase,
  getTutorCaseById
}; 