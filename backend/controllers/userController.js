const userRepository = require('../repositories/UserRepository');
const User = require('../models/User');

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

module.exports = {
  getCurrentUser,
  upgradeTutor,
  toggleTutorPublic,
}; 