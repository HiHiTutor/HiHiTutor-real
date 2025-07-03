const TutorCase = require('../models/TutorCase');

// 獲取所有導師案例
const getAllTutorCases = async (req, res) => {
  try {
    const cases = await TutorCase.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        cases: cases
      }
    });
  } catch (error) {
    console.error('獲取導師個案列表時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案列表時發生錯誤'
    });
  }
};

const createTutorCase = async (req, res) => {
  try {
    const {
      student,
      title,
      description,
      subject,
      subjects,
      category,
      subCategory,
      regions,
      subRegions,
      mode,
      experience,
      lessonDetails
    } = req.body;

    // 驗證必要欄位
    if (!student || !title || !description || !subjects || !category || !lessonDetails) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位'
      });
    }

    // 驗證課堂詳情
    if (!lessonDetails.duration || !lessonDetails.pricePerLesson || !lessonDetails.lessonsPerWeek) {
      return res.status(400).json({
        success: false,
        message: '請填寫完整的課堂詳情'
      });
    }

    // 驗證課堂時長
    if (lessonDetails.duration < 30 || lessonDetails.duration > 180 || lessonDetails.duration % 30 !== 0) {
      return res.status(400).json({
        success: false,
        message: '課堂時長必須在30-180分鐘之間，且必須是30分鐘的倍數'
      });
    }

    // 驗證每週堂數
    if (lessonDetails.lessonsPerWeek < 1) {
      return res.status(400).json({
        success: false,
        message: '每週至少要有1堂課'
      });
    }

    const newCase = new TutorCase({
      student,
      title,
      description,
      subject,
      subjects,
      category,
      subCategory,
      regions,
      subRegions,
      mode,
      experience,
      lessonDetails,
      status: 'open',
      isApproved: false
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      data: newCase,
      message: '成功創建導師個案'
    });
  } catch (error) {
    console.error('創建導師個案時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建導師個案時發生錯誤'
    });
  }
};

const getTutorCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    let tutorCase = null;

    // 首先嘗試使用 ObjectId 查找
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      tutorCase = await TutorCase.findById(id);
    }

    // 如果找不到，嘗試使用自定義 ID 查找
    if (!tutorCase) {
      tutorCase = await TutorCase.findOne({ id: id });
    }

    if (!tutorCase) {
      return res.status(404).json({
        success: false,
        message: '找不到該導師個案'
      });
    }

    res.json({
      success: true,
      data: tutorCase
    });
  } catch (error) {
    console.error('獲取導師個案詳情時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師個案詳情時發生錯誤'
    });
  }
};

module.exports = {
  getAllTutorCases,
  createTutorCase,
  getTutorCaseById
}; 