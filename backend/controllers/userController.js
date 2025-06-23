const userRepository = require('../repositories/UserRepository');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET_NAME } = require('../config/s3');

const getCurrentUser = async (req, res) => {
  try {
    // 檢查是否已登入
    if (!req.user) {
      console.log('❌ 獲取用戶資料失敗: 未登入');
      return res.status(401).json({ success: false, message: '未登入' });
    }

    // 檢查用戶 ID
    if (!req.user.id) {
      console.log('❌ 獲取用戶資料失敗: 無效的用戶 ID');
      return res.status(401).json({ success: false, message: '無效的用戶 ID' });
    }

    const currentUser = await userRepository.getUserById(req.user.id);

    if (!currentUser) {
      console.log('❌ 獲取用戶資料失敗: 用戶不存在');
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    // 移除敏感資料
    const { password, ...safeUser } = currentUser;
    console.log('✅ 用戶資料獲取成功:', safeUser.name);
    
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('❌ 獲取用戶資料錯誤:', error.message);
    res.status(500).json({
      success: false,
      message: '伺服器內部錯誤'
    });
  }
};

exports.upgradeToTutor = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: '用戶不存在' });

    if (user.userType !== 'student') {
      return res.status(400).json({ message: '只有 student 用戶可以申請升級為導師' });
    }

    const {
      gender, birthDate, teachingExperienceYears, educationLevel,
      subjects, examResults, teachingAreas, availableTime,
      teachingMethods, classType, sessionRate, introduction,
      courseFeatures, documents, avatarUrl
    } = req.body;

    user.tutorProfile = {
      gender,
      birthDate,
      teachingExperienceYears,
      educationLevel,
      subjects,
      examResults,
      teachingAreas,
      availableTime,
      teachingMethods,
      classType,
      sessionRate,
      introduction,
      courseFeatures,
      documents,
      avatarUrl,
      displayPublic: false,
      applicationStatus: 'pending'
    };

    await user.save();
    res.status(200).json({ message: '升級申請已提交，等待審批' });
  } catch (error) {
    console.error('導師升級錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
};

const upgradeTutor = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      gender, birthDate, teachingExperienceYears, educationLevel,
      subjects, examResults, teachingAreas, availableTime,
      teachingMethods, classType, sessionRate, introduction,
      courseFeatures, documents
    } = req.body;

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '找不到用戶' });
    }

    // 檢查用戶類型，只有 student 可以申請升級
    if (user.userType !== 'student') {
      return res.status(400).json({ error: '只有 student 用戶可以申請升級為導師' });
    }

    // 驗證必要欄位
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'subjects 必須為非空陣列' });
    }

    if (!sessionRate || sessionRate < 100) {
      return res.status(400).json({ error: 'sessionRate 不得少於 100' });
    }

    // 更新 tutorProfile 資料
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'tutorProfile.gender': gender,
          'tutorProfile.birthDate': birthDate ? new Date(birthDate) : undefined,
          'tutorProfile.teachingExperienceYears': teachingExperienceYears,
          'tutorProfile.educationLevel': educationLevel,
          'tutorProfile.subjects': subjects,
          'tutorProfile.examResults': examResults,
          'tutorProfile.teachingAreas': teachingAreas,
          'tutorProfile.availableTime': availableTime,
          'tutorProfile.teachingMethods': teachingMethods,
          'tutorProfile.classType': classType,
          'tutorProfile.sessionRate': sessionRate,
          'tutorProfile.introduction': introduction,
          'tutorProfile.courseFeatures': courseFeatures,
          'tutorProfile.documents': documents,
          'tutorProfile.applicationStatus': 'pending'
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '找不到用戶' });
    }

    res.status(200).json({ 
      success: true, 
      message: '升級資料已提交' 
    });
  } catch (error) {
    console.error('升級導師錯誤:', error);
    res.status(500).json({ message: '升級導師失敗', error: error.message });
  }
};

const toggleTutorPublic = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    console.log('🔍 切換導師公開狀態:', {
      tutorId,
      currentUserId,
      currentUserRole
    });

    // 檢查導師是否存在
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '導師不存在'
      });
    }

    // 檢查是否為導師
    if (tutor.userType !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: '該用戶不是導師'
      });
    }

    // 權限檢查：只能修改自己的資料，或 admin 可修改任意導師
    if (currentUserRole !== 'admin' && currentUserId !== tutorId) {
      return res.status(403).json({
        success: false,
        message: '無權限修改其他導師的資料'
      });
    }

    // 切換 displayPublic 狀態
    const newStatus = !tutor.tutorProfile.displayPublic;
    
    const updatedTutor = await User.findByIdAndUpdate(
      tutorId,
      {
        $set: {
          'tutorProfile.displayPublic': newStatus
        }
      },
      { new: true }
    ).select('-password');

    console.log('✅ 導師公開狀態切換成功:', {
      tutorId,
      oldStatus: tutor.tutorProfile.displayPublic,
      newStatus,
      updatedBy: currentUserRole === 'admin' ? 'admin' : 'self'
    });

    res.json({
      success: true,
      newStatus: newStatus,
      message: `導師資料已${newStatus ? '公開' : '隱藏'}`
    });

  } catch (error) {
    console.error('❌ 切換導師公開狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '切換公開狀態失敗',
      error: error.message
    });
  }
};

// 設定 multer 為 memory storage
const storage = multer.memoryStorage();

// 檔案過濾器 - 只接受圖片
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只接受 JPEG 和 PNG 圖片格式'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  }
});

// 上傳頭像
const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params; // 這個 id 現在是 userId
    const tokenUserId = req.user.userId; // 從 JWT token 中取得 userId
    const tokenId = req.user.id; // MongoDB 的 _id
    const userRole = req.user.role;

    console.log('🔍 權限檢查詳細資訊:', {
      requestedUserId: id,
      tokenUserId,
      tokenId,
      userRole,
      reqUser: req.user, // 完整的 req.user 物件
      params: req.params // 完整的 req.params 物件
    });

    // 檢查 token 中是否有 userId
    if (!tokenUserId) {
      console.log('❌ JWT token 中缺少 userId 欄位');
      return res.status(401).json({
        success: false,
        message: 'JWT token 格式錯誤，缺少 userId'
      });
    }

    // 權限檢查：只允許本人或 admin 上傳
    // 檢查 userId 是否匹配，或者是否為 admin
    const isOwnUser = tokenUserId === id;
    const isAdmin = userRole === 'admin';
    
    console.log('🔐 權限判斷:', {
      isOwnUser,
      isAdmin,
      tokenUserId,
      requestedId: id,
      userIdMatch: tokenUserId === id,
      userRoleMatch: userRole === 'admin'
    });

    if (!isOwnUser && !isAdmin) {
      console.log('❌ 權限驗證失敗:', {
        reason: '既不是本人也不是 admin',
        tokenUserId,
        requestedId: id,
        userRole
      });
      return res.status(403).json({
        success: false,
        message: '無權限上傳此用戶的頭像'
      });
    }

    console.log('✅ 權限驗證通過');

    // 檢查用戶是否存在 - 使用 userId 欄位查找
    const user = await User.findOne({ userId: id });
    if (!user) {
      console.log('❌ 找不到用戶:', { userId: id });
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    console.log('✅ 用戶存在:', { userId: id, userName: user.name });

    // 檢查是否有檔案上傳
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請選擇要上傳的圖片'
      });
    }

    // 取得檔案副檔名
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return res.status(400).json({
        success: false,
        message: '只接受 JPEG 和 PNG 圖片格式'
      });
    }

    // 建立 S3 檔案路徑：avatars/{userId}.{ext}
    const key = `avatars/${id}${ext}`;

    // 上傳到 S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);

    // 建立公開 URL
    const avatarUrl = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${key}`;

    // 更新用戶資料 - 使用 userId 查找並更新
    const updateData = {};
    
    // 如果是導師，更新 tutorProfile.avatarUrl
    if (user.userType === 'tutor') {
      updateData['tutorProfile.avatarUrl'] = avatarUrl;
    }
    
    // 同時更新主要的 avatar 欄位
    updateData.avatar = avatarUrl;

    await User.findOneAndUpdate({ userId: id }, updateData);

    console.log('✅ 頭像上傳成功:', {
      userId: id,
      avatarUrl,
      uploadedBy: tokenUserId || tokenId
    });

    res.json({
      success: true,
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('❌ 頭像上傳失敗:', error);
    res.status(500).json({
      success: false,
      message: '頭像上傳失敗',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentUser,
  upgradeTutor,
  toggleTutorPublic,
  uploadAvatar,
  upload
}; 