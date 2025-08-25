const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/tutors
router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    console.log('📝 查詢參數:', { featured, limit });
    
    let query = { userType: 'tutor' };
    if (featured === 'true') {
      query.isTop = true;
    }
    
    console.log('🔍 MongoDB 查詢條件:', query);
    
    const limitNum = parseInt(limit) || 15;
    console.log('📊 查詢限制:', limitNum);

    const tutors = await User.find(query)
      .limit(limitNum)
      .select('name subjects tutorProfile rating avatar isVip isTop tutorId');
    
    console.log(`✅ 從 MongoDB 找到 ${tutors.length} 個導師`);

    const formattedTutors = tutors.map(tutor => ({
      id: tutor._id,
      tutorId: tutor.tutorId,
      name: tutor.name,
      subjects: tutor.subjects || [],
      experience: tutor.tutorProfile?.teachingExperienceYears || 0,
      education: tutor.tutorProfile?.educationLevel || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || 'https://hi-hi-tutor-real-backend2.vercel.app/avatars/default.png',
      avatarOffsetX: tutor.tutorProfile?.avatarOffsetX || 50,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false,
      // 添加性別信息
      tutorProfile: {
        gender: tutor.tutorProfile?.gender || null
      }
    }));

    console.log('📤 返回格式化後的導師數據');
    res.json(formattedTutors);
  } catch (error) {
    console.error('❌ 獲取導師數據時出錯:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
});

// GET /api/tutors/recommended
router.get('/recommended', async (req, res) => {
  try {
    console.log('🔍 獲取推薦導師');
    
    const recommendedTutors = await User.find({
      userType: 'tutor',
      'tutorProfile.applicationStatus': 'approved',
      isTop: true
    }).select('name subjects tutorProfile rating avatar isVip isTop tutorId');
    
    console.log(`✅ 從 MongoDB 找到 ${recommendedTutors.length} 個推薦導師`);

    const formattedTutors = recommendedTutors.map(tutor => ({
      id: tutor._id,
      tutorId: tutor.tutorId,
      name: tutor.name,
      subjects: tutor.subjects || [],
      experience: tutor.tutorProfile?.teachingExperienceYears || 0,
      education: tutor.tutorProfile?.educationLevel || '未指定',
      rating: tutor.rating || 0,
      avatarUrl: tutor.avatar || 'https://hi-hi-tutor-real-backend2.vercel.app/avatars/default.png',
      avatarOffsetX: tutor.tutorProfile?.avatarOffsetX || 50,
      isVip: tutor.isVip || false,
      isTop: tutor.isTop || false,
      // 添加性別信息
      tutorProfile: {
        gender: tutor.tutorProfile?.gender || null
      }
    }));

    console.log('📤 返回格式化後的推薦導師數據');
    res.json(formattedTutors);
  } catch (error) {
    console.error('❌ 獲取推薦導師時出錯:', error);
    res.status(500).json({ message: 'Error fetching recommended tutors' });
  }
});

module.exports = router; 