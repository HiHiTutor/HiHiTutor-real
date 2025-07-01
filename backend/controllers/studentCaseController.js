const StudentCase = require('../models/StudentCase');

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

module.exports = {
  getAllStudentCases,
  createStudentCase,
  getStudentCaseById
}; 