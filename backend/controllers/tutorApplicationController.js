const fs = require('fs');
const path = require('path');
const userRepository = require('../repositories/UserRepository');
const TutorApplication = require('../models/TutorApplication');
const User = require('../models/User');
const mongoose = require('mongoose');
const { generateUniqueTutorId } = require('../utils/tutorUtils');

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
  console.log('收到申請資料:', req.body, req.files);
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
    let userNumber = user.userId;
    if (!userNumber) {
      // 如果 userId 不存在，生成一個新的
      console.log('⚠️ 用戶沒有 userId，正在生成新的 userId...');
      const lastUser = await User.findOne({ userId: { $exists: true } }).sort({ userId: -1 });
      let newId = lastUser ? parseInt(lastUser.userId, 10) + 1 : 1000001;
      userNumber = newId.toString().padStart(7, '0');
      
      // 更新用戶資料
      user.userId = userNumber;
      await user.save();
      console.log('✅ 已為用戶生成新的 userId:', userNumber);
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

    // 1. 取得對應的 TutorApplication 記錄
    const application = await TutorApplication.findOne({ id: appId });
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: '申請不存在' 
      });
    }

    // 2. 更新其 status 和 remarks
    application.status = status || 'pending';
    application.reviewedAt = new Date();
    application.remarks = remarks || '';

    await application.save();

    // 3. 根據審核結果更新用戶資料
    if (status === 'approved') {
      console.log('[✅] 申請已批准，準備升級用戶為導師');
      
      // 用 application.userId 去 User collection
      const userId = application.userId;
      
      // 確保 userId 是有效的 ObjectId 格式
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('[❌] 無效的 userId 格式:', userId);
        return res.status(400).json({
          success: false,
          message: '無效的用戶 ID 格式'
        });
      }

      // 使用 generateUniqueTutorId 生成唯一的 tutorId
      const tutorId = await generateUniqueTutorId(User);
      console.log('[🎓] 生成的 tutorId:', tutorId);

      // 將 userType 改為 "tutor"，將 tutorProfile.applicationStatus 改為 "approved"，並設置 tutorId
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            userType: 'tutor',
            tutorId: tutorId,
            'tutorProfile.applicationStatus': 'approved',
            'tutorProfile.subjects': application.subjects, // 保存申請中的科目信息
            'tutorProfile.educationLevel': application.education, // 保存教育背景
            'tutorProfile.teachingExperienceYears': 1, // 默認教學經驗
            'tutorProfile.sessionRate': 200, // 默認堂費
            'tutorProfile.displayPublic': true, // 公開顯示
            profileStatus: 'approved',
            remarks: remarks || '審核通過'
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (updatedUser) {
        console.log('[✅] 用戶升級成功:', {
          userId: updatedUser._id,
          tutorId: updatedUser.tutorId,
          userType: updatedUser.userType,
          applicationStatus: updatedUser.tutorProfile?.applicationStatus
        });
      } else {
        console.log('[❌] 用戶升級失敗: 找不到用戶', userId);
        return res.status(404).json({
          success: false,
          message: '找不到對應的用戶'
        });
      }
    } else if (status === 'rejected') {
      console.log('[❌] 申請被拒絕，更新用戶狀態');
      
      const userId = application.userId;
      
      // 確保 userId 是有效的 ObjectId 格式
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('[❌] 無效的 userId 格式:', userId);
        return res.status(400).json({
          success: false,
          message: '無效的用戶 ID 格式'
        });
      }

      // 只更新 tutorProfile.applicationStatus 為 "rejected"
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'tutorProfile.applicationStatus': 'rejected'
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (updatedUser) {
        console.log('[✅] 用戶狀態更新成功:', {
          userId: updatedUser._id,
          userType: updatedUser.userType,
          applicationStatus: updatedUser.tutorProfile?.applicationStatus
        });
      } else {
        console.log('[❌] 用戶狀態更新失敗: 找不到用戶', userId);
        return res.status(404).json({
          success: false,
          message: '找不到對應的用戶'
        });
      }
    }

    res.json({ 
      success: true, 
      application,
      message: status === 'approved' ? '申請已批准，用戶已升級為導師' : 
               status === 'rejected' ? '申請已拒絕' : '申請狀態已更新'
    });
  } catch (error) {
    console.error('審核申請失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '審核申請失敗',
      error: error.message 
    });
  }
};

// 3. 批准導師申請
const approveTutorApplication = async (req, res) => {
  try {
    const appId = req.params.id;
    const { remarks } = req.body;

    console.log('[🔍] 批准導師申請:', appId);

    // 1. 取得對應的 TutorApplication 記錄
    const application = await TutorApplication.findOne({ id: appId });
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: '申請不存在' 
      });
    }

    // 檢查申請狀態
    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: '該申請已經被批准'
      });
    }

    if (application.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: '該申請已被拒絕，無法重新批准'
      });
    }

    // 2. 更新申請狀態為 approved
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.remarks = remarks || '';

    await application.save();

    // 3. 升級用戶為導師
    console.log('[✅] 申請已批准，準備升級用戶為導師');
    
    const userId = application.userId;
    
    // 確保 userId 是有效的 ObjectId 格式
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('[❌] 無效的 userId 格式:', userId);
      return res.status(400).json({
        success: false,
        message: '無效的用戶 ID 格式'
      });
    }

    // 使用 generateUniqueTutorId 生成唯一的 tutorId
    const tutorId = await generateUniqueTutorId(User);
    console.log('[🎓] 生成的 tutorId:', tutorId);

    // 將 userType 改為 "tutor"，將 tutorProfile.applicationStatus 改為 "approved"，並設置 tutorId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          userType: 'tutor',
          tutorId: tutorId,
          'tutorProfile.applicationStatus': 'approved',
          'tutorProfile.subjects': application.subjects, // 保存申請中的科目信息
          'tutorProfile.educationLevel': application.education, // 保存教育背景
          'tutorProfile.teachingExperienceYears': 1, // 默認教學經驗
          'tutorProfile.sessionRate': 200, // 默認堂費
          'tutorProfile.displayPublic': true, // 公開顯示
          profileStatus: 'approved',
          remarks: remarks || '審核通過'
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (updatedUser) {
      console.log('[✅] 用戶升級成功:', {
        userId: updatedUser._id,
        tutorId: updatedUser.tutorId,
        userType: updatedUser.userType,
        applicationStatus: updatedUser.tutorProfile?.applicationStatus
      });
    } else {
      console.log('[❌] 用戶升級失敗: 找不到用戶', userId);
      return res.status(404).json({
        success: false,
        message: '找不到對應的用戶'
      });
    }

    res.json({
      success: true,
      message: '申請已批准，用戶已升級為導師',
      data: {
        applicationId: application.id,
        tutorId: tutorId,
        status: application.status,
        reviewedAt: application.reviewedAt,
        remarks: application.remarks
      }
    });

  } catch (error) {
    console.error('[❌] 批准申請失敗:', error);
    res.status(500).json({
      success: false,
      message: '批准申請失敗',
      error: error.message
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
  approveTutorApplication,
  createTutorUser,
  getAllApplications,
  getAllTutorApplications
}; 