const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/tutors
router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    let query = { userType: 'tutor' };

    // 如果請求 featured 導師
    if (featured === 'true') {
      query.isTop = true;
    }

    // 設置查詢限制
    const limitNum = parseInt(limit) || 15;

    const tutors = await User.find(query)
      .limit(limitNum)
      .select('name subject education experience rating avatar isVip isTop');

    // 轉換數據格式以匹配前端期望的格式
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

    res.json(formattedTutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
});

// GET /api/tutors/recommended
router.get('/recommended', async (req, res) => {
  try {
    const recommendedTutors = await User.find({
      userType: 'tutor',
      'tutorProfile.applicationStatus': 'approved',
      isTop: true
    }).select('name subject education experience rating avatar isVip isTop');

    // 轉換數據格式以匹配前端期望的格式
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

    res.json(formattedTutors);
  } catch (error) {
    console.error('Error fetching recommended tutors:', error);
    res.status(500).json({ message: 'Error fetching recommended tutors' });
  }
});

module.exports = router; 