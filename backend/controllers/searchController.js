const User = require('../models/User');
const TutorCase = require('../models/TutorCase');

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
    
    // 搜尋導師 - 使用 tutors API 邏輯
    const matchedTutors = await User.find({
      userType: 'tutor',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'tutorProfile.subjects': { $regex: query, $options: 'i' } },
        { 'tutorProfile.introduction': { $regex: query, $options: 'i' } },
        { 'tutorProfile.education': { $regex: query, $options: 'i' } },
        { 'tutorProfile.experience': { $regex: query, $options: 'i' } }
      ]
    }).populate('tutorProfile');

    // 格式化導師數據以匹配前端期望的結構
    const formattedTutors = matchedTutors.map(tutor => ({
      id: tutor._id.toString(),
      name: tutor.name || '未指定',
      subject: tutor.tutorProfile?.subjects?.[0] || '未指定',
      subjects: tutor.tutorProfile?.subjects || [],
      education: tutor.tutorProfile?.education || '未指定',
      experience: tutor.tutorProfile?.experience || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false,
      introduction: tutor.tutorProfile?.introduction || '',
      regions: tutor.tutorProfile?.regions || [],
      modes: tutor.tutorProfile?.modes || []
    }));
    
    // 搜尋導師搵學生個案 (find-student-cases)
    const matchedCases = await TutorCase.find({
      isApproved: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { subjects: { $regex: query, $options: 'i' } },
        { regions: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } }
      ]
    }).populate('student', 'name avatar');

    // 格式化個案數據
    const formattedCases = matchedCases.map(caseItem => ({
      id: caseItem._id.toString(),
      title: caseItem.title,
      description: caseItem.description,
      subject: caseItem.subject,
      subjects: caseItem.subjects,
      regions: caseItem.regions,
      mode: caseItem.mode,
      modes: caseItem.modes,
      lessonDetails: caseItem.lessonDetails,
      experience: caseItem.experience,
      status: caseItem.status,
      featured: caseItem.featured,
      category: caseItem.category,
      subCategory: caseItem.subCategory,
      student: caseItem.student ? {
        id: caseItem.student._id.toString(),
        name: caseItem.student.name,
        avatar: caseItem.student.avatar
      } : null,
      createdAt: caseItem.createdAt,
      updatedAt: caseItem.updatedAt
    }));
    
    console.log(`🔍 搜尋結果: 找到 ${formattedTutors.length} 個導師, ${formattedCases.length} 個個案`);
    
    res.json({
      tutors: formattedTutors,
      cases: formattedCases
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