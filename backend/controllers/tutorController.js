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
          name: tutor.name,
          subject: tutor.subjects?.[0] || '未指定',
          education: tutor.tutorProfile?.education || '未指定',
          experience: tutor.tutorProfile?.experience || '未指定',
          rating: tutor.rating || 0,
          avatarUrl: tutor.avatar || `https://randomuser.me/api/portraits/${tutor.gender || 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
          isVip: tutor.isVip || false,
          isTop: tutor.isTop || false
        }));

        console.log('📤 返回所有導師數據');
        return res.json(formattedTutors);
      }

      const formattedTutors = featuredTutors.map(tutor => ({
        id: tutor._id,
        name: tutor.name,
        subject: tutor.subjects?.[0] || '未指定',
        education: tutor.tutorProfile?.education || '未指定',
        experience: tutor.tutorProfile?.experience || '未指定',
        rating: tutor.rating || 0,
        avatarUrl: tutor.avatar || `https://randomuser.me/api/portraits/${tutor.gender || 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
        isVip: tutor.isVip || false,
        isTop: tutor.isTop || false
      }));

      console.log('📤 返回置頂或 VIP 導師數據');
      return res.json(formattedTutors);
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
      name: tutor.name,
      subject: tutor.subjects?.[0] || '未指定',
      education: tutor.tutorProfile?.education || '未指定',
      experience: tutor.tutorProfile?.experience || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || `https://randomuser.me/api/portraits/${tutor.gender || 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false
    }));

    console.log('📤 返回所有導師數據');
    res.json(formattedTutors);
  } catch (error) {
    console.error('❌ 獲取導師數據時出錯:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
};

// 根據 ID 回傳特定導師
const getTutorById = (req, res) => {
  const id = parseInt(req.params.id);
  const tutor = tutors.find(tutor => tutor.id === id);
  
  if (!tutor) {
    return res.status(404).json({ error: '找不到該導師' });
  }
  
  res.json(tutor);
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
      .select('tutorId name avatar subjects teachingAreas teachingMethods experience rating introduction')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 獲取總數
    const total = await User.countDocuments(query);

    res.json({
      tutors,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
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

module.exports = {
  getAllTutors,
  getTutorById,
  getTutorByTutorId,
  getTutors,
  getTutorDetail
}; 