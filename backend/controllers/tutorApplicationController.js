const fs = require('fs');
const path = require('path');
const userRepository = require('../repositories/UserRepository');
const TutorApplication = require('../models/TutorApplication');

// 載入申請記錄（保留作為備用）
const loadApplications = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/tutorApplications.json'), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.log('[⚠️] 無法載入申請記錄，使用空陣列');
    return [];
  }
};

// 儲存申請記錄（保留作為備用）
const saveApplications = (applications) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, '../data/tutorApplications.json'),
      JSON.stringify(applications, null, 2)
    );
    console.log('[✅] 申請記錄已儲存');
  } catch (e) {
    console.error('[❌] 儲存申請記錄失敗:', e);
  }
};

// 1. 提交導師申請
const submitTutorApplication = async (req, res) => {
  try {
    const { education, experience, subjects, documents } = req.body;
    const userId = req.user.id;

    // 檢查必要欄位
    if (!education || !experience || !subjects || !documents) {
      return res.status(400).json({
        success: false,
        message: '請提供所有必要欄位'
      });
    }

    // 檢查是否已有待審核的申請
    const existingApplication = await TutorApplication.findOne({
      userId: userId,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: '您已有待審核的申請'
      });
    }

    // 載入用戶資料
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶資料'
      });
    }

    // 從用戶資料中取得 userNumber (userId)
    const userNumber = user.userId;
    if (!userNumber) {
      return res.status(400).json({
        success: false,
        message: '用戶編號不存在'
      });
    }

    // 生成申請 ID
    const applicationCount = await TutorApplication.countDocuments();
    const applicationId = `TA${String(applicationCount + 1).padStart(3, '0')}`;

    // 創建新申請
    const newApplication = new TutorApplication({
      id: applicationId,
      userId,
      userNumber,
      name: user.name,
      email: user.email,
      phone: user.phone,
      education,
      experience,
      subjects,
      documents,
      status: 'pending'
    });

    await newApplication.save();

    // 更新用戶升級狀態
    user.upgradeRequested = true;
    await userRepository.updateUser(user);

    res.status(201).json({
      success: true,
      message: '申請已成功提交',
      data: newApplication
    });
  } catch (error) {
    console.error('提交申請失敗:', error);
    res.status(500).json({
      success: false,
      message: '提交申請失敗'
    });
  }
};

// 2. 審核導師申請
const reviewTutorApplication = async (req, res) => {
  try {
    const appId = req.params.id;
    const { status, remarks } = req.body;

    const application = await TutorApplication.findOne({ id: appId });
    if (!application) {
      return res.status(404).json({ message: '申請不存在' });
    }

    application.status = status || 'pending';
    application.reviewedAt = new Date();
    application.remarks = remarks || '';

    await application.save();

    // 自動升級 userType
    if (status === 'approved') {
      const user = await userRepository.getUserById(application.userId);
      console.log('[升級用戶]', user);
      if (user) {
        user.userType = 'tutor';
        await userRepository.updateUser(user);
        console.log('[升級完成]', user);
      } else {
        console.log('[升級失敗] 找不到 user', application.userId);
      }
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('審核申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '審核申請失敗' 
    });
  }
};

// 3. 手動創建導師用戶
const createTutorUser = async (req, res) => {
  try {
    const { name, email, password, phone, education, experience, subjects } = req.body;

    // 檢查必要欄位
    if (!name || !email || !password || !phone || !education || !experience || !subjects) {
      return res.status(400).json({
        success: false,
        message: '請提供所有必要欄位'
      });
    }

    // 檢查 email 是否已被註冊
    const existingUser = userRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此電子郵件已被註冊'
      });
    }

    // 創建新導師用戶
    const newTutor = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      phone,
      role: 'tutor',
      education,
      experience,
      subjects,
      createdAt: Date.now()
    };

    // 儲存用戶資料
    const users = userRepository.getAllUsers();
    users.push(newTutor);
    userRepository.saveUsers(users);

    res.status(201).json({
      success: true,
      message: '導師用戶已成功創建',
      data: {
        id: newTutor.id,
        name: newTutor.name,
        email: newTutor.email,
        role: newTutor.role
      }
    });
  } catch (error) {
    console.error('創建導師用戶失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建導師用戶失敗'
    });
  }
};

// 獲取所有申請記錄
const getAllApplications = async (req, res) => {
  try {
    const applications = await TutorApplication.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('獲取申請記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取申請記錄失敗'
    });
  }
};

const getAllTutorApplications = async (req, res) => {
  try {
    const applications = await TutorApplication.find().sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: applications 
    });
  } catch (error) {
    console.error('❌ 無法獲取導師申請列表:', error);
    res.status(500).json({ 
      success: false, 
      message: '無法獲取導師申請列表', 
      error: error.message 
    });
  }
};

module.exports = {
  submitTutorApplication,
  reviewTutorApplication,
  createTutorUser,
  getAllApplications,
  getAllTutorApplications
}; 