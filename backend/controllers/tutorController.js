const tutors = require('../data/tutors');
const User = require('../models/User');

// 回傳所有導師
const getAllTutors = (req, res) => {
  res.json(tutors);
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
exports.getTutorDetail = async (req, res) => {
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