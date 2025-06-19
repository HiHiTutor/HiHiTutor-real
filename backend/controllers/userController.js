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

module.exports = {
  getCurrentUser
}; 