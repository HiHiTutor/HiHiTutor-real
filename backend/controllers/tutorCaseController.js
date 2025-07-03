const TutorCase = require('../models/TutorCase');
const { buildPriceQuery, extractPriceFromItem } = require('../utils/priceRangeUtils');

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
    if (req.query.priceRange && req.query.priceRange !== 'unlimited') {
      const priceQuery = buildPriceQuery(req.query.priceRange);
      if (Object.keys(priceQuery).length > 0) {
        query['lessonDetails.pricePerLesson'] = priceQuery;
      }
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
        subject: caseObj.subject || caseObj.subjects?.[0] || '未指定',
        subjects: Array.isArray(caseObj.subjects) ? caseObj.subjects : [caseObj.subject].filter(Boolean),
        region: caseObj.regions?.[0] || '未指定',
        regions: Array.isArray(caseObj.regions) ? caseObj.regions : [caseObj.region].filter(Boolean),
        mode: caseObj.mode || caseObj.modes?.[0] || '未指定',
        modes: Array.isArray(caseObj.modes) ? caseObj.modes : [caseObj.mode].filter(Boolean),
        experienceLevel: caseObj.experience || '未指定',
        budget: caseObj.lessonDetails?.pricePerLesson ? 
          `$${caseObj.lessonDetails.pricePerLesson}` : 
          '待議',
        lessonDetails: caseObj.lessonDetails,
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

// 搜尋導師案例
const searchTutorCases = async (req, res) => {
  try {
    const {
      keyword,
      category,
      subCategory,
      subject,
      subjects,
      region,
      subRegion,
      mode,
      modes,
      priceRange,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // 構建查詢條件
    const query = { isApproved: true };

    // 關鍵字搜尋
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 分類篩選
    if (category && category !== 'unlimited') {
      query.category = category;
    }

    // 子分類篩選
    if (subCategory && subCategory !== 'unlimited') {
      const subArr = Array.isArray(subCategory) ? subCategory : subCategory.split(',');
      query.subCategory = { $in: subArr };
    }

    // 科目篩選
    if (subject && subject !== 'unlimited') {
      query.subject = subject;
    }

    if (subjects && subjects !== 'unlimited') {
      const subjectArray = subjects.split(',');
      query.subjects = { $in: subjectArray };
    }

    // 地區篩選
    if (region && region !== 'unlimited') {
      const regionArray = Array.isArray(region) ? region : [region];
      query.regions = { $in: regionArray };
    }

    // 子地區篩選
    if (subRegion && subRegion !== 'unlimited') {
      const subRegionArray = Array.isArray(subRegion) ? subRegion : subRegion.split(',');
      query.subRegions = { $in: subRegionArray };
    }

    // 教學模式篩選
    if (mode && mode !== 'unlimited') {
      query.mode = mode;
    }

    if (modes && modes !== 'unlimited') {
      const modeArray = Array.isArray(modes) ? modes : modes.split(',');
      query.modes = { $in: modeArray };
    }

    // 價格範圍篩選
    if (priceRange && priceRange !== 'unlimited') {
      const priceQuery = buildPriceQuery(priceRange);
      if (Object.keys(priceQuery).length > 0) {
        query['lessonDetails.pricePerLesson'] = priceQuery;
      }
    }

    console.log('🔍 導師案例搜尋條件:', query);

    // 計算分頁
    const skip = (Number(page) - 1) * Number(limit);

    // 執行查詢
    const [cases, total] = await Promise.all([
      TutorCase.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      TutorCase.countDocuments(query)
    ]);

    // 格式化結果
    const formattedCases = cases.map(caseItem => {
      const caseObj = caseItem.toObject();
      return {
        id: caseObj.id || caseObj._id.toString(),
        title: caseObj.title || `${caseObj.subject} 補習個案`,
        subject: caseObj.subject || caseObj.subjects?.[0] || '未指定',
        subjects: Array.isArray(caseObj.subjects) ? caseObj.subjects : [caseObj.subject].filter(Boolean),
        region: caseObj.regions?.[0] || '未指定',
        regions: Array.isArray(caseObj.regions) ? caseObj.regions : [caseObj.region].filter(Boolean),
        mode: caseObj.mode || caseObj.modes?.[0] || '未指定',
        modes: Array.isArray(caseObj.modes) ? caseObj.modes : [caseObj.mode].filter(Boolean),
        experienceLevel: caseObj.experience || '未指定',
        budget: caseObj.lessonDetails?.pricePerLesson ? 
          `$${caseObj.lessonDetails.pricePerLesson}` : 
          '待議',
        lessonDetails: caseObj.lessonDetails,
        createdAt: caseObj.createdAt,
        avatarUrl: caseObj.avatarUrl,
        category: caseObj.category,
        subCategory: caseObj.subCategory,
        status: caseObj.status,
        featured: caseObj.featured
      };
    });

    res.json({
      success: true,
      data: {
        cases: formattedCases,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ 搜尋導師案例時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '搜尋失敗',
      error: error.message
    });
  }
};

module.exports = {
  getAllTutorCases,
  createTutorCase,
  getTutorCaseById,
  searchTutorCases
}; 