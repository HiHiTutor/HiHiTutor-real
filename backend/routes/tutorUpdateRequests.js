const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const User = require('../models/User');
const mongoose = require('mongoose');

// 輔助函數：根據ID類型查找用戶
const findUserById = async (id) => {
  // 檢查是否為有效的ObjectId
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return await User.findById(id);
  } else {
    // 如果不是ObjectId，則使用userId查詢
    return await User.findOne({ userId: id });
  }
};

// POST /api/tutor-update-requests - 導師提交修改申請
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🚀 收到導師更新申請:', {
      userId: req.user?.userId,
      body: req.body
    });
    
    const { userId } = req.user;
    const { id } = req.user; // MongoDB的_id
    
    console.log('🔍 用戶信息:', {
      userId: userId, // 字符串ID
      id: id, // MongoDB ObjectId
      userType: req.user.userType
    });
    
    if (!userId) {
      console.log('❌ 沒有用戶ID');
      return res.status(400).json({ success: false, message: '沒有用戶ID' });
    }
    
    // 檢查用戶是否為導師 - 使用輔助函數查找用戶
    const user = await findUserById(userId);
    if (!user) {
      console.log('❌ 找不到用戶:', userId);
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }
    
    console.log('✅ 找到用戶:', {
      name: user.name,
      userType: user.userType,
      userId: user.userId
    });
    
    if (user.userType !== 'tutor') {
      console.log('❌ 用戶不是導師:', user.userType);
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

    console.log('📝 準備的待審批資料:', pendingData);

    // 更新用戶的待審批資料和狀態 - 使用用戶的MongoDB _id
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        pendingProfile: pendingData,
        profileStatus: 'pending' // 同時設置 profileStatus 為 pending
      },
      { new: true }
    );

    console.log('✅ 更新成功:', {
      userId: updatedUser._id,
      name: updatedUser.name,
      hasPendingProfile: !!updatedUser.pendingProfile
    });

    res.json({
      success: true,
      message: '更新申請已提交，等待管理員審批',
      data: updatedUser.pendingProfile
    });

  } catch (error) {
    console.error('❌ 提交導師更新申請失敗:', error);
    console.error('❌ 錯誤詳情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ success: false, message: '提交申請失敗' });
  }
});

// GET /api/tutor-update-requests - Admin 查看待審批資料
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // 構建查詢條件 - 修復查詢邏輯
    const query = {
      userType: 'tutor',
      pendingProfile: { $exists: true, $ne: null }
    };
    
    if (status) {
      query['pendingProfile.status'] = status;
    } else {
      // 默認查詢所有待審批申請（包括沒有status的）
      query['$or'] = [
        { 'pendingProfile.status': 'pending' },
        { 'pendingProfile.status': { $exists: false } },
        { 'pendingProfile.status': null }
      ];
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

    const user = await findUserById(id);
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
      user._id,
      {
        ...updateData,
        profileStatus: 'approved', // 設置 profileStatus 為 approved
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

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    if (!user.pendingProfile || user.pendingProfile.status !== 'pending') {
      return res.status(400).json({ success: false, message: '沒有待審批的申請' });
    }

    // 更新待審批狀態為拒絕
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
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

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    // 檢查權限：只有申請者本人或管理員可以查看
    if (user.userId !== userId && req.user.role !== 'admin') {
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