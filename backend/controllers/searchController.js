const User = require('../models/User');
const TutorCase = require('../models/TutorCase');
const SearchLog = require('../models/SearchLog');

// 記錄搜尋日誌
const logSearch = async (req, searchData, results) => {
  try {
    const searchLog = new SearchLog({
      userId: req.user?.id || null,
      userType: req.user?.userType || 'anonymous',
      searchQuery: searchData.query,
      searchType: searchData.type || 'general',
      subjects: searchData.subjects || [],
      regions: searchData.regions || [],
      filters: searchData.filters || {},
      resultsCount: {
        tutors: results.tutors.length,
        cases: results.cases.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await searchLog.save();
    console.log('📝 搜尋日誌已記錄:', searchLog._id);
  } catch (error) {
    console.error('❌ 記錄搜尋日誌失敗:', error);
  }
};

// 搜尋導師與個案
const search = async (req, res) => {
  try {
    const query = req.query.q;
    
    console.log('🔍 搜尋請求:', { query });
    
    // 如果沒有提供關鍵字，回傳空結果
    if (!query) {
      return res.json({
        tutors: [],
        cases: []
      });
    }
    
    // 搜尋導師 - 修復陣列字段搜尋
    const matchedTutors = await User.find({
      userType: 'tutor',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'tutorProfile.subjects': { $in: [new RegExp(query, 'i')] } },
        { 'tutorProfile.introduction': { $regex: query, $options: 'i' } },
        { 'tutorProfile.educationLevel': { $regex: query, $options: 'i' } },
        { 'tutorProfile.teachingExperienceYears': { $regex: query, $options: 'i' } }
      ]
    }).populate('tutorProfile');

    console.log('📊 找到導師數量:', matchedTutors.length);

    // 格式化導師數據以匹配前端期望的結構
    const formattedTutors = matchedTutors.map(tutor => ({
      id: tutor._id.toString(),
      tutorId: tutor.tutorId || tutor._id.toString(),
      name: tutor.name || '未指定',
      subject: tutor.tutorProfile?.subjects?.[0] || '未指定',
      subjects: tutor.tutorProfile?.subjects || [],
      education: tutor.tutorProfile?.educationLevel || '未指定',
      experience: tutor.tutorProfile?.teachingExperienceYears || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false,
      introduction: tutor.tutorProfile?.introduction || '',
      regions: tutor.tutorProfile?.teachingAreas || [],
      modes: tutor.tutorProfile?.teachingMethods || []
    }));
    
    // 搜尋導師搵學生個案 (find-student-cases) - 修復陣列字段搜尋
    const matchedCases = await TutorCase.find({
      isApproved: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { subjects: { $in: [new RegExp(query, 'i')] } },
        { regions: { $in: [new RegExp(query, 'i')] } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } }
      ]
    });

    console.log('📊 找到個案數量:', matchedCases.length);

    // 格式化個案數據
    const formattedCases = matchedCases.map(caseItem => ({
      id: caseItem._id.toString(),
      title: caseItem.title,
      description: caseItem.description,
      subject: {
        label: caseItem.subject || caseItem.subjects?.[0] || '未指定'
      },
      subjects: caseItem.subjects || [],
      region: {
        label: caseItem.regions?.[0] || '未指定'
      },
      regions: caseItem.regions || [],
      mode: caseItem.mode,
      modes: caseItem.modes || [],
      lessonDetails: caseItem.lessonDetails,
      experience: caseItem.experience,
      status: caseItem.status,
      featured: caseItem.featured,
      category: caseItem.category,
      subCategory: caseItem.subCategory,
      budget: caseItem.lessonDetails?.pricePerLesson ? 
        `$${caseItem.lessonDetails.pricePerLesson}` : 
        '待議',
      student: caseItem.student ? {
        id: caseItem.student._id.toString()
      } : null,
      createdAt: caseItem.createdAt,
      updatedAt: caseItem.updatedAt
    }));
    
    const results = {
      tutors: formattedTutors,
      cases: formattedCases
    };
    
    // 記錄搜尋日誌
    await logSearch(req, {
      query,
      type: 'general',
      subjects: [],
      regions: [],
      filters: {}
    }, results);
    
    console.log(`🔍 搜尋結果: 找到 ${formattedTutors.length} 個導師, ${formattedCases.length} 個個案`);
    
    res.json(results);
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