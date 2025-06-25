const User = require('../models/User');

// 獲取所有待審核的導師個人資料
const getPendingTutorProfiles = async (req, res) => {
  try {
    console.log('🔍 獲取待審核導師個人資料');
    
    const tutors = await User.find({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    }).select('-password -refreshToken');
    
    console.log(`✅ 找到 ${tutors.length} 個待審核導師`);
    
    res.status(200).json({
      success: true,
      data: tutors,
      message: `找到 ${tutors.length} 個待審核導師`
    });
  } catch (error) {
    console.error('❌ 獲取待審核導師資料失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '無法載入待審核資料',
      message: error.message 
    });
  }
};

// 批准導師個人資料
const approveTutorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    console.log('✅ 批准導師個人資料:', { id, remarks });
    
    const tutor = await User.findById(id);
    
    if (!tutor) {
      return res.status(404).json({ 
        success: false,
        error: '找不到導師' 
      });
    }
    
    if (tutor.userType !== 'tutor') {
      return res.status(400).json({ 
        success: false,
        error: '該用戶不是導師' 
      });
    }
    
    if (tutor.profileStatus !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: '該導師資料不在待審核狀態' 
      });
    }
    
    // 更新狀態為已批准
    tutor.profileStatus = 'approved';
    tutor.remarks = remarks || '';
    
    await tutor.save();
    
    console.log('✅ 導師個人資料已批准:', tutor.name);
    
    res.status(200).json({ 
      success: true,
      message: '已批准導師個人資料',
      data: {
        tutorId: tutor._id,
        tutorName: tutor.name,
        profileStatus: tutor.profileStatus,
        remarks: tutor.remarks
      }
    });
  } catch (error) {
    console.error('❌ 批准導師資料失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '批准失敗',
      message: error.message 
    });
  }
};

// 拒絕導師個人資料
const rejectTutorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    console.log('❌ 拒絕導師個人資料:', { id, remarks });
    
    const tutor = await User.findById(id);
    
    if (!tutor) {
      return res.status(404).json({ 
        success: false,
        error: '找不到導師' 
      });
    }
    
    if (tutor.userType !== 'tutor') {
      return res.status(400).json({ 
        success: false,
        error: '該用戶不是導師' 
      });
    }
    
    if (tutor.profileStatus !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: '該導師資料不在待審核狀態' 
      });
    }
    
    // 檢查是否提供了拒絕原因
    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: '拒絕時必須提供原因' 
      });
    }
    
    // 更新狀態為已拒絕
    tutor.profileStatus = 'rejected';
    tutor.remarks = remarks;
    
    await tutor.save();
    
    console.log('❌ 導師個人資料已拒絕:', tutor.name);
    
    res.status(200).json({ 
      success: true,
      message: '已拒絕導師個人資料',
      data: {
        tutorId: tutor._id,
        tutorName: tutor.name,
        profileStatus: tutor.profileStatus,
        remarks: tutor.remarks
      }
    });
  } catch (error) {
    console.error('❌ 拒絕導師資料失敗:', error);
    res.status(500).json({ 
      success: false,
      error: '拒絕失敗',
      message: error.message 
    });
  }
};

module.exports = {
  getPendingTutorProfiles,
  approveTutorProfile,
  rejectTutorProfile
}; 