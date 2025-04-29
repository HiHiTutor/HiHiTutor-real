const fs = require('fs');
const path = require('path');
const { loadUsers, saveUsers } = require('../utils/userStorage');

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
    const users = loadUsers();
    const user = users.find(u => u.id === userId);

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
    const { applicationId } = req.params;
    const { status, comment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的審核狀態'
      });
    }

    // 載入申請記錄
    const applications = loadApplications();
    const applicationIndex = applications.findIndex(app => app.id === applicationId);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '找不到申請記錄'
      });
    }

    // 更新申請狀態
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status,
      comment,
      updatedAt: new Date().toISOString()
    };

    // 如果審核通過，更新用戶角色
    if (status === 'approved') {
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === applications[applicationIndex].userId);

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          role: 'tutor'
        };
        saveUsers(users);
      }
    }

    // 儲存更新後的申請記錄
    saveApplications(applications);

    res.json({
      success: true,
      message: '申請已審核',
      data: applications[applicationIndex]
    });
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

    // 載入用戶資料
    const users = loadUsers();
    
    // 檢查 email 是否已被註冊
    const existingUser = users.find(u => u.email === email);
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
    users.push(newTutor);
    saveUsers(users);

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

module.exports = {
  submitTutorApplication,
  reviewTutorApplication,
  createTutorUser,
  getAllApplications
}; 