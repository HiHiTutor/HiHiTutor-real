const User = require('../models/User');

// 搜尋導師與個案
const search = async (req, res) => {
  try {
    const query = req.query.q;
    
    // 如果沒有提供關鍵字，回傳空結果
    if (!query) {
      return res.json({
        tutors: [],
        cases: []
      });
    }
    
    // 搜尋導師 - 使用真實資料庫數據
    const matchedTutors = await User.find({
      userType: 'tutor',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subjects: { $regex: query, $options: 'i' } },
        { 'tutorProfile.experience': { $regex: query, $options: 'i' } },
        { 'tutorProfile.education': { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    // 格式化導師數據以匹配前端期望的結構
    const formattedTutors = matchedTutors.map(tutor => ({
      id: tutor._id.toString(),
      name: tutor.name || '未指定',
      subject: tutor.subjects?.[0] || '未指定',
      education: tutor.tutorProfile?.education || '未指定',
      experience: tutor.tutorProfile?.experience || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false
    }));
    
    // 搜尋個案 - 暫時返回空數組，因為個案搜尋邏輯需要另外實現
    const matchedCases = [];
    
    console.log(`🔍 搜尋結果: 找到 ${formattedTutors.length} 個導師`);
    
    res.json({
      tutors: formattedTutors,
      cases: matchedCases
    });
  } catch (error) {
    console.error('❌ 搜尋時發生錯誤:', error);
    res.status(500).json({
      tutors: [],
      cases: [],
      error: '搜尋失敗'
    });
  }
};

module.exports = {
  search
}; 