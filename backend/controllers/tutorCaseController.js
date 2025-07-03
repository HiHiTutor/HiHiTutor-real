const TutorCase = require('../models/TutorCase');

// 獲取所有導師案例
const getAllTutorCases = async (req, res) => {
  try {
    console.log('📥 getAllTutorCases 被調用，查詢參數:', req.query);
    
    // 構建查詢條件
    const query = {};
    
    // 只顯示已審批的案例
    query.isApproved = true;
    
    // 如果是獲取推薦案例
    if (req.query.featured === 'true') {
      query.featured = true;
    }
    
    // 分類篩選
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // 子分類篩選
    if (req.query.subCategory) {
      const subArr = Array.isArray(req.query.subCategory) ? req.query.subCategory : req.query.subCategory.split(',');
      query.subCategory = { $in: subArr };
    }
    
    // 地區篩選
    if (req.query.region) {
      const regionArr = Array.isArray(req.query.region) ? req.query.region : req.query.region.split(',');
      query.regions = { $in: regionArr };
    }
    
    // 價格範圍篩選
    if (req.query.priceMin || req.query.priceMax) {
      query['lessonDetails.pricePerLesson'] = {};
      if (req.query.priceMin) query['lessonDetails.pricePerLesson'].$gte = Number(req.query.priceMin);
      if (req.query.priceMax) query['lessonDetails.pricePerLesson'].$lte = Number(req.query.priceMax);
    }
    
    console.log('🔍 執行查詢條件:', query);
    
    const cases = await TutorCase.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);
    
    console.log('✅ 查詢結果數量:', cases.length);
    
    // 轉換數據格式以匹配前端期望
    const formattedCases = cases.map(caseItem => {
      const caseObj = caseItem.toObject();
      return {
        id: caseObj.id || caseObj._id.toString(),
        title: caseObj.title || `${caseObj.subject} 補習個案`,
        subject: {
          label: caseObj.subject || caseObj.subjects?.[0] || '未指定'
        },
        region: {
          label: caseObj.regions?.[0] || '未指定'
        },
        mode: {
          label: caseObj.mode || caseObj.modes?.[0] || '未指定'
        },
        experienceLevel: {
          label: caseObj.experience || '未指定'
        },
        budget: caseObj.lessonDetails?.pricePerLesson ? 
          `$${caseObj.lessonDetails.pricePerLesson}` : 
          '待議',
        lessonDetails: caseObj.lessonDetails,
        modes: caseObj.modes || [caseObj.mode].filter(Boolean),
        createdAt: caseObj.createdAt,
        avatarUrl: caseObj.avatarUrl,
        category: caseObj.category,
        subCategory: caseObj.subCategory,
        status: caseObj.status,
        featured: caseObj.featured
      };
    });
    
    console.log('📦 格式化後的案例數量:', formattedCases.length);
    
    res.json({
      success: true,
      data: {
        cases: formattedCases,
        totalCount: formattedCases.length
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