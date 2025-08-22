const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 獲取所有導師資料修改記錄
router.get('/tutor-changes', verifyToken, isAdmin, async (req, res) => {
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
    const formattedChanges = tutors.map(tutor => {
      // 確保有有效的ID
      const validTutorId = tutor.tutorId || tutor.userId || `unknown_${tutor._id}`;
      
      return {
        tutorId: validTutorId,
        name: tutor.name || '未知姓名',
        email: tutor.email || '未知郵箱',
        changes: (tutor.profileChangeLog || []).map(change => ({
          timestamp: change.timestamp,
          fields: change.fields || [],
          oldValues: change.oldValues || {},
          newValues: change.newValues || {},
          ipAddress: change.ipAddress,
          userAgent: change.userAgent
        }))
      };
    }).filter(tutor => tutor.changes && tutor.changes.length > 0); // 只返回有修改記錄的導師
    
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
router.get('/tutor-changes/:tutorId', verifyToken, isAdmin, async (req, res) => {
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
      tutorId: tutor.tutorId || tutor.userId || `unknown_${tutor._id}`,
      name: tutor.name || '未知姓名',
      email: tutor.email || '未知郵箱',
      changes: (tutor.profileChangeLog || []).map(change => ({
        timestamp: change.timestamp,
        fields: change.fields || [],
        oldValues: change.oldValues || {},
        newValues: change.newValues || {},
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
router.get('/recent-changes', verifyToken, isAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 計算24小時前的時間
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    console.log(`📊 recent-changes API: 只返回 ${oneDayAgo.toLocaleString()} 之後的修改記錄`);
    
    // 獲取最近的修改記錄，只包含24小時內的
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
        $match: {
          'profileChangeLog.timestamp': { $gte: oneDayAgo }
        }
      },
      {
        $sort: { 'profileChangeLog.timestamp': -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          tutorId: { $ifNull: ['$tutorId', '$userId', { $concat: ['unknown_', { $toString: '$_id' }] }] },
          name: { $ifNull: ['$name', '未知姓名'] },
          email: { $ifNull: ['$email', '未知郵箱'] },
          change: {
            timestamp: '$profileChangeLog.timestamp',
            fields: { $ifNull: ['$profileChangeLog.fields', []] },
            newValues: { $ifNull: ['$profileChangeLog.newValues', {}] },
            oldValues: { $ifNull: ['$profileChangeLog.oldValues', {}] },
            ipAddress: '$profileChangeLog.ipAddress',
            userAgent: '$profileChangeLog.userAgent'
          }
        }
      }
    ]);
    
    // 過濾掉無效的記錄
    const validChanges = recentChanges.filter(change => 
      change.change && 
      change.change.timestamp && 
      Array.isArray(change.change.fields) && 
      change.change.fields.length > 0
    );
    
    console.log(`📊 recent-changes API: 找到 ${recentChanges.length} 條24小時內的記錄，有效記錄 ${validChanges.length} 條`);
    
    res.json({
      success: true,
      data: validChanges
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
router.get('/export-changes', verifyToken, isAdmin, async (req, res) => {
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