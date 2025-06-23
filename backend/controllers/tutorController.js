const tutors = require('../data/tutors');
const User = require('../models/User');

// 回傳所有導師
const getAllTutors = async (req, res) => {
  try {
    const { limit, featured } = req.query;
    console.log('📝 查詢參數:', { limit, featured });
    
    let query = { userType: 'tutor' };
    let featuredQuery = { ...query, $or: [{ isTop: true }, { isVip: true }] };
    
    // 如果是 featured 請求，先嘗試獲取置頂或 VIP 導師
    if (featured === 'true') {
      const featuredTutors = await User.aggregate([
        { $match: featuredQuery },
        {
          $addFields: {
            // 計算排序分數
            sortScore: {
              $add: [
                // VIP置頂 + 高評分 = 10000 + 評分
                { $multiply: [
                  { $cond: [
                    { $and: [
                      { $eq: ['$isVip', true] },
                      { $eq: ['$isTop', true] }
                    ]},
                    10000,
                    0
                  ]},
                  1
                ]},
                // VIP置頂 = 5000
                { $multiply: [
                  { $cond: [
                    { $and: [
                      { $eq: ['$isVip', true] },
                      { $eq: ['$isTop', true] }
                    ]},
                    5000,
                    0
                  ]},
                  1
                ]},
                // 置頂 + 高評分 = 2000 + 評分
                { $multiply: [
                  { $cond: [
                    { $and: [
                      { $eq: ['$isVip', false] },
                      { $eq: ['$isTop', true] }
                    ]},
                    2000,
                    0
                  ]},
                  1
                ]},
                // 置頂 = 1000
                { $multiply: [
                  { $cond: [
                    { $and: [
                      { $eq: ['$isVip', false] },
                      { $eq: ['$isTop', true] }
                    ]},
                    1000,
                    0
                  ]},
                  1
                ]},
                // 普通tutor + 高評分 = 100 + 評分
                { $multiply: [
                  { $cond: [
                    { $and: [
                      { $eq: ['$isVip', false] },
                      { $eq: ['$isTop', false] }
                    ]},
                    100,
                    0
                  ]},
                  1
                ]},
                // 評分
                { $multiply: [{ $ifNull: ['$rating', 0] }, 10] }
              ]
            }
          }
        },
        { $sort: { sortScore: -1 } },
        { $limit: parseInt(limit) || 15 }
      ]);

      // 如果沒有置頂或 VIP 導師，則返回所有導師
      if (featuredTutors.length === 0) {
        console.log('⚠️ 沒有置頂或 VIP 導師，返回所有導師');
        const allTutors = await User.aggregate([
          { $match: query },
          {
            $addFields: {
              // 生成隨機數用於評分相同時的排序
              randomSort: { $rand: {} }
            }
          },
          { $sort: { rating: -1, randomSort: 1 } },  // 先按評分降序，評分相同則按隨機數升序
          { $limit: parseInt(limit) || 15 }
        ]);
        
        const formattedTutors = allTutors.map(tutor => ({
          id: tutor._id,
          userId: tutor.userId,
          name: tutor.name,
          subject: tutor.tutorProfile?.subjects?.[0] || '未指定',
          education: tutor.tutorProfile?.educationLevel || '未指定',
          experience: tutor.tutorProfile?.teachingExperienceYears ? `${tutor.tutorProfile.teachingExperienceYears}年教學經驗` : '未指定',
          rating: tutor.rating || 0,
          avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
          isVip: tutor.isVip || false,
          isTop: tutor.isTop || false
        }));

        console.log('📤 返回所有導師數據');
        return res.json({ data: { tutors: formattedTutors } });
      }

      const formattedTutors = featuredTutors.map(tutor => ({
        id: tutor._id,
        userId: tutor.userId,
        name: tutor.name,
        subject: tutor.subjects?.[0] || '未指定',
        education: tutor.tutorProfile?.education || '未指定',
        experience: tutor.tutorProfile?.experience || '未指定',
        rating: tutor.rating || 0,
        avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
        isVip: tutor.isVip || false,
        isTop: tutor.isTop || false
      }));

      console.log('📤 返回置頂或 VIP 導師數據');
      return res.json({ data: { tutors: formattedTutors } });
    }
    
    // 非 featured 請求，返回所有導師
    const tutors = await User.aggregate([
      { $match: query },
      {
        $addFields: {
          // 生成隨機數用於評分相同時的排序
          randomSort: { $rand: {} }
        }
      },
      { $sort: { rating: -1, randomSort: 1 } },  // 先按評分降序，評分相同則按隨機數升序
      { $limit: parseInt(limit) || 15 }
    ]);
    
    console.log(`✅ 從 MongoDB 找到 ${tutors.length} 個導師`);

    const formattedTutors = tutors.map(tutor => ({
      id: tutor._id,
      userId: tutor.userId,
      name: tutor.name,
      subject: tutor.tutorProfile?.subjects?.[0] || '未指定',
      education: tutor.tutorProfile?.educationLevel || '未指定',
      experience: tutor.tutorProfile?.teachingExperienceYears ? `${tutor.tutorProfile.teachingExperienceYears}年教學經驗` : '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false
    }));

    console.log('📤 返回所有導師數據');
    res.json({ data: { tutors: formattedTutors } });
  } catch (error) {
    console.error('❌ 獲取導師數據時出錯:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
};

// 根據 ID 回傳特定導師
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 查找導師:', id);
    
    // 嘗試多種方式查找導師
    let tutor = null;
    
    // 1. 先嘗試用 userId 查找
    if (id && id !== 'undefined') {
      tutor = await User.findOne({ 
        userId: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    // 2. 如果找不到，嘗試用 MongoDB _id 查找
    if (!tutor && id && id.length === 24) {
      tutor = await User.findOne({ 
        _id: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    // 3. 如果還是找不到，嘗試用 tutorId 查找
    if (!tutor) {
      tutor = await User.findOne({ 
        tutorId: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    if (!tutor) {
      console.log('❌ 找不到導師:', id);
      return res.status(404).json({ 
        success: false,
        message: '找不到該導師' 
      });
    }
    
    console.log('✅ 找到導師:', tutor.name);
    
    // 回傳導師公開資料
    const publicProfile = {
      id: tutor._id,
      userId: tutor.userId,
      tutorId: tutor.tutorId,
      name: tutor.name,
      avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
      avatarOffsetX: tutor.tutorProfile?.avatarOffsetX || 50,
      subjects: tutor.tutorProfile?.subjects || [],
      teachingAreas: tutor.tutorProfile?.teachingAreas || [],
      teachingMethods: tutor.tutorProfile?.teachingMethods || [],
      experience: tutor.tutorProfile?.teachingExperienceYears || 0,
      introduction: tutor.tutorProfile?.introduction || '',
      education: tutor.tutorProfile?.educationLevel || '',
      qualifications: tutor.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: tutor.tutorProfile?.sessionRate || 0,
      availableTime: tutor.tutorProfile?.availableTime || [],
      examResults: tutor.tutorProfile?.examResults || '',
      courseFeatures: tutor.tutorProfile?.courseFeatures || '',
      rating: tutor.rating || 0
    };
    
    res.json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    console.error('❌ 獲取導師詳情錯誤:', error);
    res.status(500).json({ 
      success: false,
      message: '獲取導師詳情失敗' 
    });
  }
};

// 根據 tutorId 回傳導師公開 profile
const getTutorByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const user = await User.findOne({ tutorId });
    if (!user || user.userType !== 'tutor') {
      return res.status(404).json({ success: false, message: '找不到導師' });
    }
    // 只回傳公開資料
    const publicProfile = {
      tutorId: user.tutorId,
      education: user.tutorProfile?.education,
      experience: user.tutorProfile?.experience,
      specialties: user.tutorProfile?.specialties,
      introduction: user.tutorProfile?.introduction,
      // 其他你想公開的欄位
    };
    res.json({ success: true, data: publicProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取導師列表
const getTutors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      subjects = [],
      areas = [],
      methods = [],
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // 構建查詢條件
    const query = {
      userType: 'tutor',
      isActive: true
    };

    // 搜尋條件
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { introduction: { $regex: search, $options: 'i' } }
      ];
    }

    // 科目篩選
    if (subjects.length > 0) {
      query['subjects'] = { $in: subjects };
    }

    // 地區篩選
    if (areas.length > 0) {
      query['teachingAreas'] = { $in: areas };
    }

    // 授課方式篩選
    if (methods.length > 0) {
      query['teachingMethods'] = { $in: methods };
    }

    // 構建排序條件
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 執行查詢
    const tutors = await User.find(query)
      .select('userId tutorId name avatar subjects teachingAreas teachingMethods experience rating introduction')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 獲取總數
    const total = await User.countDocuments(query);

    res.json({
      data: {
        tutors,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error in getTutors:', error);
    res.status(500).json({ message: '獲取導師列表失敗' });
  }
};

// 獲取導師詳情
const getTutorDetail = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutor = await User.findOne({
      tutorId,
      userType: 'tutor',
      isActive: true
    }).select('-password -refreshToken');

    if (!tutor) {
      return res.status(404).json({ message: '找不到該導師' });
    }

    res.json(tutor);
  } catch (error) {
    console.error('Error in getTutorDetail:', error);
    res.status(500).json({ message: '獲取導師詳情失敗' });
  }
};

// 獲取當前登入導師的 profile
const getTutorProfile = async (req, res) => {
  try {
    const tokenUserId = req.user.userId; // 從 JWT token 中取得 userId
    const tokenId = req.user.id; // MongoDB 的 _id
    
    console.log('🔍 獲取導師 profile:', {
      tokenUserId,
      tokenId,
      userType: req.user.userType,
      role: req.user.role
    });

    // 使用 userId 查找用戶
    const user = await User.findOne({ userId: tokenUserId }).select('-password');
    
    if (!user) {
      console.log('❌ 找不到用戶:', tokenUserId);
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    console.log('✅ 用戶存在:', { userId: tokenUserId, userName: user.name, userType: user.userType });

    // 檢查是否為導師
    if (user.userType !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: '只有導師才能使用此 API'
      });
    }

    console.log('✅ 導師 profile 獲取成功:', user.name);

    // 回傳符合前端期望的格式
    res.json({
      tutorId: user.tutorId || user._id,
      name: user.name,
      gender: user.tutorProfile?.gender || 'male',
      birthDate: user.tutorProfile?.birthDate,
      subjects: user.tutorProfile?.subjects || [],
      teachingAreas: user.tutorProfile?.teachingAreas || [],
      teachingMethods: user.tutorProfile?.teachingMethods || [],
      experience: user.tutorProfile?.teachingExperienceYears || 0,
      introduction: user.tutorProfile?.introduction || '',
      education: user.tutorProfile?.educationLevel || '',
      qualifications: user.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: user.tutorProfile?.sessionRate || 0,
      availableTime: user.tutorProfile?.availableTime || [],
      avatar: user.avatar || user.tutorProfile?.avatarUrl || '',
      avatarOffsetX: user.tutorProfile?.avatarOffsetX || 50,
      examResults: user.tutorProfile?.examResults || '',
      courseFeatures: user.tutorProfile?.courseFeatures || '',
      documents: {
        idCard: '',
        educationCert: ''
      }
    });
  } catch (error) {
    console.error('❌ 獲取導師 profile 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師 profile 失敗',
      error: error.message
    });
  }
};

// 更新當前登入導師的 profile
const updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('🔍 更新導師 profile:', userId, updateData);

    // 檢查導師是否存在
    const tutor = await User.findById(userId);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '找不到導師'
      });
    }

    if (tutor.userType !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: '該用戶不是導師'
      });
    }

    // 構建更新對象
    const updateObject = {};
    
    // 直接更新的字段
    if (updateData.name !== undefined) updateObject.name = updateData.name;
    if (updateData.avatar !== undefined) updateObject.avatar = updateData.avatar;
    
    // tutorProfile 子對象的字段
    if (updateData.gender !== undefined) updateObject['tutorProfile.gender'] = updateData.gender;
    if (updateData.birthDate !== undefined) updateObject['tutorProfile.birthDate'] = updateData.birthDate;
    if (updateData.experience !== undefined) updateObject['tutorProfile.teachingExperienceYears'] = updateData.experience;
    if (updateData.education !== undefined) updateObject['tutorProfile.educationLevel'] = updateData.education;
    if (updateData.subjects !== undefined) updateObject['tutorProfile.subjects'] = updateData.subjects;
    if (updateData.examResults !== undefined) updateObject['tutorProfile.examResults'] = updateData.examResults;
    if (updateData.teachingAreas !== undefined) updateObject['tutorProfile.teachingAreas'] = updateData.teachingAreas;
    if (updateData.availableTime !== undefined) updateObject['tutorProfile.availableTime'] = updateData.availableTime;
    if (updateData.teachingMethods !== undefined) updateObject['tutorProfile.teachingMethods'] = updateData.teachingMethods;
    if (updateData.hourlyRate !== undefined) updateObject['tutorProfile.sessionRate'] = updateData.hourlyRate;
    if (updateData.introduction !== undefined) updateObject['tutorProfile.introduction'] = updateData.introduction;
    if (updateData.courseFeatures !== undefined) updateObject['tutorProfile.courseFeatures'] = updateData.courseFeatures;
    if (updateData.qualifications !== undefined) {
      // 將 qualifications 字符串數組轉換為 documents 對象數組
      const documents = updateData.qualifications.map(qual => ({
        type: qual,
        url: ''
      }));
      updateObject['tutorProfile.documents'] = documents;
    }
    if (updateData.avatarOffsetX !== undefined) updateObject['tutorProfile.avatarOffsetX'] = updateData.avatarOffsetX;

    console.log('📝 更新對象:', updateObject);

    // 更新導師資料
    const updatedTutor = await User.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      { new: true }
    ).select('-password');

    console.log('✅ 導師 profile 更新成功');

    res.json({
      success: true,
      data: updatedTutor,
      message: '導師資料更新成功'
    });
  } catch (error) {
    console.error('❌ 更新導師 profile 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新導師 profile 失敗',
      error: error.message
    });
  }
};

module.exports = {
  getAllTutors,
  getTutorById,
  getTutorByTutorId,
  getTutors,
  getTutorDetail,
  getTutorProfile,
  updateTutorProfile
}; 