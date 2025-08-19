const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/adminMiddleware');
const User = require('../models/User');

// 獲取所有導師資料修改記錄
router.get('/tutor-changes', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, tutorId } = req.query;
    
    // 構建查詢條件
    const query = {
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] }
    };
    
    if (tutorId) {
      query.$or = [
        { tutorId: tutorId },
        { userId: tutorId }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 獲取有修改記錄的導師
    const tutors = await User.find(query)
      .select('name email tutorId userId profileChangeLog createdAt')
      .sort({ 'profileChangeLog.timestamp': -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 統計總數
    const total = await User.countDocuments(query);
    
    // 格式化修改記錄
    const formattedChanges = tutors.map(tutor => ({
      tutorId: tutor.tutorId || tutor.userId,
      name: tutor.name,
      email: tutor.email,
      changes: tutor.profileChangeLog.map(change => ({
        timestamp: change.timestamp,
        fields: change.fields,
        oldValues: change.oldValues,
        newValues: change.newValues,
        ipAddress: change.ipAddress,
        userAgent: change.userAgent
      }))
    }));
    
    res.json({
      success: true,
      data: formattedChanges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('獲取導師修改記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取修改記錄失敗',
      error: error.message
    });
  }
});

// 獲取特定導師的修改記錄
router.get('/tutor-changes/:tutorId', verifyAdmin, async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const tutor = await User.findOne({
      $or: [
        { tutorId: tutorId },
        { userId: tutorId }
      ],
      userType: { $in: ['tutor', 'organization'] }
    }).select('name email tutorId userId profileChangeLog createdAt');
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '找不到導師'
      });
    }
    
    const formattedChanges = {
      tutorId: tutor.tutorId || tutor.userId,
      name: tutor.name,
      email: tutor.email,
      changes: tutor.profileChangeLog.map(change => ({
        timestamp: change.timestamp,
        fields: change.fields,
        oldValues: change.oldValues,
        newValues: change.newValues,
        ipAddress: change.ipAddress,
        userAgent: change.userAgent
      }))
    };
    
    res.json({
      success: true,
      data: formattedChanges
    });
    
  } catch (error) {
    console.error('獲取導師修改記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取修改記錄失敗',
      error: error.message
    });
  }
});

// 獲取最近的修改記錄（用於儀表板）
router.get('/recent-changes', verifyAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 獲取最近的修改記錄
    const recentChanges = await User.aggregate([
      {
        $match: {
          userType: { $in: ['tutor', 'organization'] },
          profileChangeLog: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$profileChangeLog'
      },
      {
        $sort: { 'profileChangeLog.timestamp': -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          tutorId: { $ifNull: ['$tutorId', '$userId'] },
          name: 1,
          email: 1,
          change: '$profileChangeLog'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: recentChanges
    });
    
  } catch (error) {
    console.error('獲取最近修改記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取最近修改記錄失敗',
      error: error.message
    });
  }
});

// 導出修改記錄為CSV（可選功能）
router.get('/export-changes', verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 構建日期範圍查詢
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery['profileChangeLog.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const tutors = await User.find({
      userType: { $in: ['tutor', 'organization'] },
      profileChangeLog: { $exists: true, $ne: [] },
      ...dateQuery
    }).select('name email tutorId userId profileChangeLog');
    
    // 生成CSV內容
    let csvContent = '導師ID,姓名,電子郵件,修改時間,修改字段,舊值,新值\n';
    
    tutors.forEach(tutor => {
      tutor.profileChangeLog.forEach(change => {
        const fields = change.fields.join('; ');
        const oldValues = JSON.stringify(change.oldValues).replace(/"/g, '""');
        const newValues = JSON.stringify(change.newValues).replace(/"/g, '""');
        
        csvContent += `"${tutor.tutorId || tutor.userId}","${tutor.name}","${tutor.email}","${change.timestamp}","${fields}","${oldValues}","${newValues}"\n`;
      });
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tutor-changes.csv"');
    res.send(csvContent);
    
  } catch (error) {
    console.error('導出修改記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '導出失敗',
      error: error.message
    });
  }
});

module.exports = router; 