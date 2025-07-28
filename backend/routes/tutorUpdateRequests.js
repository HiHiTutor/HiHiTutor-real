const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const User = require('../models/User');

// POST /api/tutor-update-requests - 導師提交修改申請
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 檢查用戶是否為導師
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }
    
    if (user.userType !== 'tutor') {
      return res.status(403).json({ success: false, message: '只有導師可以提交更新申請' });
    }

    // 準備待審批資料
    const pendingData = {
      name: req.body.name || null,
      phone: req.body.phone || null,
      email: req.body.email || null,
      tutorProfile: req.body.tutorProfile || null,
      documents: req.body.documents || null,
      status: 'pending',
      submittedAt: new Date()
    };

    // 更新用戶的待審批資料
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { pendingProfile: pendingData },
      { new: true }
    );

    res.json({
      success: true,
      message: '更新申請已提交，等待管理員審批',
      data: updatedUser.pendingProfile
    });

  } catch (error) {
    console.error('提交導師更新申請失敗:', error);
    res.status(500).json({ success: false, message: '提交申請失敗' });
  }
});

// GET /api/tutor-update-requests - Admin 查看待審批資料
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // 構建查詢條件
    const query = {
      userType: 'tutor',
      'pendingProfile.status': { $exists: true, $ne: null }
    };
    
    if (status) {
      query['pendingProfile.status'] = status;
    }

    const skip = (page - 1) * limit;
    
    const pendingRequests = await User.find(query)
      .select('name email phone userType pendingProfile createdAt')
      .sort({ 'pendingProfile.submittedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: pendingRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('獲取待審批資料失敗:', error);
    res.status(500).json({ success: false, message: '獲取資料失敗' });
  }
});

// POST /api/tutor-update-requests/:id/approve - Admin 審批通過
router.post('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    if (!user.pendingProfile || user.pendingProfile.status !== 'pending') {
      return res.status(400).json({ success: false, message: '沒有待審批的申請' });
    }

    // 更新主資料
    const updateData = {};
    
    if (user.pendingProfile.name) {
      updateData.name = user.pendingProfile.name;
    }
    if (user.pendingProfile.phone) {
      updateData.phone = user.pendingProfile.phone;
    }
    if (user.pendingProfile.email) {
      updateData.email = user.pendingProfile.email;
    }
    if (user.pendingProfile.tutorProfile) {
      updateData.tutorProfile = {
        ...user.tutorProfile,
        ...user.pendingProfile.tutorProfile
      };
    }
    if (user.pendingProfile.documents) {
      updateData.documents = user.pendingProfile.documents;
    }

    // 更新用戶資料並清除待審批資料
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...updateData,
        'pendingProfile.status': 'approved',
        'pendingProfile.adminRemarks': adminRemarks || ''
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '申請已審批通過',
      data: updatedUser
    });

  } catch (error) {
    console.error('審批導師申請失敗:', error);
    res.status(500).json({ success: false, message: '審批失敗' });
  }
});

// DELETE /api/tutor-update-requests/:id - Admin 拒絕修改申請
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    if (!user.pendingProfile || user.pendingProfile.status !== 'pending') {
      return res.status(400).json({ success: false, message: '沒有待審批的申請' });
    }

    // 更新待審批狀態為拒絕
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        'pendingProfile.status': 'rejected',
        'pendingProfile.adminRemarks': adminRemarks || ''
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '申請已拒絕',
      data: updatedUser.pendingProfile
    });

  } catch (error) {
    console.error('拒絕導師申請失敗:', error);
    res.status(500).json({ success: false, message: '拒絕申請失敗' });
  }
});

// GET /api/tutor-update-requests/:id - 獲取特定申請詳情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    // 檢查權限：只有申請者本人或管理員可以查看
    if (user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '沒有權限查看此申請' });
    }

    res.json({
      success: true,
      data: user.pendingProfile
    });

  } catch (error) {
    console.error('獲取申請詳情失敗:', error);
    res.status(500).json({ success: false, message: '獲取詳情失敗' });
  }
});

module.exports = router; 