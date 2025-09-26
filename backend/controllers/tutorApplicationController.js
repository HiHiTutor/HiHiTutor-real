const fs = require('fs');
const path = require('path');
const userRepository = require('../repositories/UserRepository');
const TutorApplication = require('../models/TutorApplication');
const User = require('../models/User');
const mongoose = require('mongoose');
const { generateUniqueTutorId } = require('../utils/tutorUtils');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET_NAME } = require('../config/s3');

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
  console.log('請求頭 Content-Type:', req.headers['content-type']);
  console.log('用戶ID:', req.user?.id);
  
  try {
    const { 
      name, 
      gender, 
      birthDate, 
      education, 
      experience, 
      courseFeatures, 
      subjects, 
      regions, 
      teachingMode, 
      hourlyRate 
    } = req.body;
    const userId = req.user.id;

    console.log('解析的字段:', {
      name, gender, birthDate, education, experience, 
      courseFeatures, subjects, regions, 
      teachingMode, hourlyRate
    });

    // 檢查必要欄位
    if (!name || !gender || !birthDate || !education || !experience || !courseFeatures || !subjects || !teachingMode || !hourlyRate) {
      console.log('缺少必要欄位:', {
        name: !!name, gender: !!gender, birthDate: !!birthDate, 
        education: !!education, experience: !!experience, 
        courseFeatures: !!courseFeatures, 
        subjects: !!subjects, teachingMode: !!teachingMode, hourlyRate: !!hourlyRate
      });
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

    // 處理文件上傳到S3
    let uploadedDocuments = [];
    console.log('🔍 調試文件上傳:', {
      hasFiles: !!req.files,
      filesLength: req.files ? req.files.length : 0,
      files: req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })) : []
    });
    
    if (req.files && req.files.length > 0) {
      console.log('📁 開始處理文件上傳，共', req.files.length, '個文件');
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const timestamp = Date.now();
          const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_');
          const key = `uploads/tutor-applications/${userNumber}/${timestamp}-${sanitizedFileName}`;
          
          console.log('📁 上傳文件到S3:', { 
            originalname: file.originalname, 
            key,
            size: file.size,
            mimetype: file.mimetype,
            hasBuffer: !!file.buffer
          });
          
          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
            // 移除ACL設置，使用bucket policy控制權限
          });

          await s3Client.send(command);
          
          const fileUrl = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${key}`;
          uploadedDocuments.push(fileUrl);
          
          console.log('✅ 文件上傳成功:', fileUrl);
        } catch (uploadError) {
          console.error('❌ 文件上傳失敗:', file.originalname, uploadError);
          // 繼續處理其他文件，不中斷整個流程
        }
      }
    } else {
      console.log('⚠️ 沒有文件需要上傳');
    }
    
    console.log('📋 最終上傳的文件列表:', uploadedDocuments);

    // 創建新申請
    const newApplication = new TutorApplication({
      id: applicationId,
      userId,
      userNumber,
      name: name || user.name,
      email: user.email,
      phone: user.phone,
      gender,
      birthDate,
      education,
      experience,
      courseFeatures,
      subjects: JSON.parse(subjects),
      regions: JSON.parse(regions),
      teachingMode: JSON.parse(teachingMode),
      hourlyRate,
      documents: uploadedDocuments, // 使用上傳到S3的URL
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
            // 保存所有申請資料
            'tutorProfile.subjects': application.subjects, // 保存申請中的科目信息
            'tutorProfile.educationLevel': application.education, // 保存教育背景
            'tutorProfile.teachingExperienceYears': application.experience || 1, // 保存實際教學經驗
            'tutorProfile.sessionRate': application.hourlyRate || 200, // 保存要求時薪
            'tutorProfile.displayPublic': true, // 公開顯示
            // 新增保存的申請資料
            'tutorProfile.gender': application.gender, // 性別
            'tutorProfile.birthDate': application.birthDate, // 出生日期
            'tutorProfile.courseFeatures': application.courseFeatures, // 課程特點
            'tutorProfile.regions': application.regions, // 上堂地區
            'tutorProfile.teachingMode': application.teachingMode, // 上堂形式
            'tutorProfile.documents': application.documents, // 上傳文件
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
          // 保存所有申請資料
          'tutorProfile.subjects': application.subjects, // 保存申請中的科目信息
          'tutorProfile.educationLevel': application.education, // 保存教育背景
          'tutorProfile.teachingExperienceYears': application.experience || 1, // 保存實際教學經驗
          'tutorProfile.sessionRate': application.hourlyRate || 200, // 保存要求時薪
          'tutorProfile.displayPublic': true, // 公開顯示
          // 新增保存的申請資料
          'tutorProfile.gender': application.gender, // 性別
          'tutorProfile.birthDate': application.birthDate, // 出生日期
          'tutorProfile.courseFeatures': application.courseFeatures, // 課程特點
          'tutorProfile.regions': application.regions, // 上堂地區
          'tutorProfile.teachingMode': application.teachingMode, // 上堂形式
          'tutorProfile.documents': application.documents, // 上傳文件
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
    const { 
      name, 
      email, 
      password, 
      phone, 
      education, 
      experience, 
      subjects,
      region,
      subRegions,
      category,
      subCategory,
      teachingMode,
      teachingSubModes,
      sessionRate,
      introduction,
      courseFeatures
    } = req.body;

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
      userType: 'tutor',
      education,
      experience,
      subjects,
      // 添加地區相關信息
      region: region || '',
      subRegions: subRegions || [],
      // 添加課程相關信息
      category: category || '',
      subCategory: subCategory || '',
      teachingMode: teachingMode || '',
      teachingSubModes: teachingSubModes || [],
      sessionRate: sessionRate || 0,
      introduction: introduction || '',
      courseFeatures: courseFeatures || '',
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
        role: newTutor.role,
        region: newTutor.region,
        subRegions: newTutor.subRegions
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