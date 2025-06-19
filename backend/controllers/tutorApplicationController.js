const fs = require('fs');
const path = require('path');
const userRepository = require('../repositories/UserRepository');

// 載入申請記錄
const loadApplications = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/tutorApplications.json'), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.log('[⚠️] 無法載入申請記錄，使用空陣列');
    return [];
  }
};

// 儲存申請記錄
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

    // 載入申請記錄
    const applications = loadApplications();
    
    // 檢查是否已有待審核的申請
    const existingApplication = applications.find(
      app => app.userId === userId && app.status === 'pending'
    );

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

    // 創建新申請
    const newApplication = {
      id: `TA${String(applications.length + 1).padStart(3, '0')}`,
      userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      education,
      experience,
      subjects,
      documents,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 儲存申請
    applications.push(newApplication);
    saveApplications(applications);

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
  const applications = loadApplications();
  const appId = req.params.id;
  const { status, remarks } = req.body;

  const app = applications.find(a => a.id === appId);
  if (!app) {
    return res.status(404).json({ message: '申請不存在' });
  }

  app.status = status || 'pending';
  app.reviewedAt = new Date().toISOString();
  app.remarks = remarks || '';

  // 自動升級 userType
  if (status === 'approved') {
    const user = await userRepository.getUserById(app.userId);
    console.log('[升級用戶]', user);
    if (user) {
      user.userType = 'tutor';
      await userRepository.updateUser(user);
      console.log('[升級完成]', user);
    } else {
      console.log('[升級失敗] 找不到 user', app.userId);
    }
  }

  saveApplications(applications);

  res.json({ success: true, application: app });
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
const getAllApplications = (req, res) => {
  try {
    const applications = loadApplications();
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
    const applications = loadApplications();
    
    // 按 createdAt 倒序排列
    const sortedApplications = applications.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.status(200).json({ 
      success: true, 
      data: sortedApplications 
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