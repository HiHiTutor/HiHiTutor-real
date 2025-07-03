const StudentCase = require('../models/StudentCase');
const { buildPriceQuery, extractPriceFromItem } = require('../utils/priceRangeUtils');

// 獲取所有學生案例
const getAllStudentCases = async (req, res) => {
  try {
    const allCases = await StudentCase.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取學生案例列表'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '獲取學生案例時發生錯誤' });
  }
};

const createStudentCase = async (req, res) => {
  try {
    const { title, category, modes, price, duration, weeklyLessons } = req.body;
    
    console.log('收到的個案數據:', req.body);
    console.log('解析的欄位:', { title, category, modes, price, duration, weeklyLessons });
    
    // 檢查必填欄位
    const missingFields = {
      title: !title,
      category: !category,
      modes: !modes,
      price: !price,
      duration: !duration,
      weeklyLessons: !weeklyLessons
    };
    
    const hasMissingFields = Object.values(missingFields).some(missing => missing);
    
    if (hasMissingFields) {
      console.log('缺少的欄位:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: '請填寫所有必要欄位',
        missing: missingFields,
        received: req.body
      });
    }
    
    // 檢查 modes 是否為陣列且不為空
    if (!Array.isArray(modes) || modes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '請選擇至少一種教學模式',
        received: { modes }
      });
    }
    
    // 檢查時長是否有效
    if (!duration || duration <= 0 || isNaN(duration)) {
      return res.status(400).json({ 
        success: false, 
        message: '請輸入有效的時長',
        received: { duration }
      });
    }
    
    // 檢查價格是否有效
    if (!price || price <= 0 || isNaN(price)) {
      return res.status(400).json({ 
        success: false, 
        message: '請輸入有效的價格',
        received: { price }
      });
    }
    
    // 檢查每週堂數是否有效
    if (!weeklyLessons || weeklyLessons <= 0 || isNaN(weeklyLessons)) {
      return res.status(400).json({ 
        success: false, 
        message: '請輸入有效的每週堂數',
        received: { weeklyLessons }
      });
    }
    
    console.log('所有驗證通過，準備保存數據');
    
    const newCase = new StudentCase({ 
      ...req.body, 
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newCase.save();
    
    console.log('成功保存個案:', newCase);
    
    res.status(201).json({
      success: true,
      data: newCase,
      message: '成功創建學生個案'
    });
  } catch (error) {
    console.error('創建學生個案失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '建立學生案例失敗',
      error: error.message 
    });
  }
};

const getStudentCaseById = async (req, res) => {
  try {
    const case_ = await StudentCase.findOne({ id: req.params.id });
    if (!case_) {
      return res.status(404).json({
        success: false,
        message: '找不到該學生個案'
      });
    }
    res.json({
      success: true,
      data: case_,
      message: '成功獲取學生個案'
    });
  } catch (error) {
    console.error('[❌] 處理單個學生個案請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取學生個案失敗'
    });
  }
};

// 搜尋學生案例
const searchStudentCases = async (req, res) => {
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
        { requirement: { $regex: keyword, $options: 'i' } }
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
        query.budget = priceQuery;
      }
    }

    console.log('🔍 學生案例搜尋條件:', query);

    // 計算分頁
    const skip = (Number(page) - 1) * Number(limit);

    // 執行查詢
    const [cases, total] = await Promise.all([
      StudentCase.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      StudentCase.countDocuments(query)
    ]);

    // 格式化結果
    const formattedCases = cases.map(caseItem => {
      const caseObj = caseItem.toObject();
      return {
        id: caseObj.id || caseObj._id.toString(),
        title: caseObj.title,
        requirement: caseObj.requirement,
        category: caseObj.category,
        subCategory: caseObj.subCategory,
        subject: caseObj.subject,
        subjects: caseObj.subjects,
        regions: caseObj.regions,
        subRegions: caseObj.subRegions,
        mode: caseObj.mode,
        modes: caseObj.modes,
        budget: caseObj.budget,
        duration: caseObj.duration,
        durationUnit: caseObj.durationUnit,
        weeklyLessons: caseObj.weeklyLessons,
        status: caseObj.status,
        featured: caseObj.featured,
        createdAt: caseObj.createdAt
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
    console.error('❌ 搜尋學生案例時發生錯誤:', error);
    res.status(500).json({
      success: false,
      message: '搜尋失敗',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudentCases,
  createStudentCase,
  getStudentCaseById,
  searchStudentCases
}; 