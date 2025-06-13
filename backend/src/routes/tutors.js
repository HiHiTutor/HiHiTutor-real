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
      .select('name subject education experience rating avatar isVip isTop');
    
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
    }).select('name subject education experience rating avatar isVip isTop');
    
    console.log(`✅ 從 MongoDB 找到 ${recommendedTutors.length} 個推薦導師`);

    const formattedTutors = recommendedTutors.map(tutor => ({
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

    console.log('📤 返回格式化後的推薦導師數據');
    res.json(formattedTutors);
  } catch (error) {
    console.error('❌ 獲取推薦導師時出錯:', error);
    res.status(500).json({ message: 'Error fetching recommended tutors' });
  }
});

module.exports = router; 