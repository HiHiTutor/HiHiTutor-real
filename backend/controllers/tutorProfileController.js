const User = require('../models/User');
const UploadLog = require('../models/UploadLog');

// 獲取所有待審核的導師個人資料
const getPendingTutorProfiles = async (req, res) => {
  try {
    console.log('🔍 獲取待審核導師個人資料');
    
    const tutors = await User.find({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    }).select('-password -refreshToken');
    
    console.log(`✅ 找到 ${tutors.length} 個待審核導師`);
    
    // 調試：檢查第一個導師的資料結構
    if (tutors.length > 0) {
      const firstTutor = tutors[0];
      console.log('🔍 第一個導師資料結構:', {
        name: firstTutor.name,
        tutorProfile: firstTutor.tutorProfile,
        hasTeachingMode: !!firstTutor.tutorProfile?.teachingMode,
        hasRegion: !!firstTutor.tutorProfile?.region,
        hasSubRegions: !!firstTutor.tutorProfile?.subRegions,
        teachingMode: firstTutor.tutorProfile?.teachingMode,
        region: firstTutor.tutorProfile?.region,
        subRegions: firstTutor.tutorProfile?.subRegions
      });
    }

    // 為每個導師獲取上傳記錄
    const tutorsWithUploads = await Promise.all(
      tutors.map(async (tutor) => {
        try {
          // 獲取該用戶的所有上傳記錄
          const uploadLogs = await UploadLog.find({ 
            userId: tutor._id 
          }).sort({ createdAt: -1 });

          // 將上傳記錄添加到導師資料中
          const tutorData = tutor.toObject();
          tutorData.uploadLogs = uploadLogs;

          return tutorData;
        } catch (error) {
          console.error(`❌ 獲取導師 ${tutor.name} 的上傳記錄失敗:`, error);
          // 如果獲取上傳記錄失敗，仍然返回導師資料
          const tutorData = tutor.toObject();
          tutorData.uploadLogs = [];
          return tutorData;
        }
      })
    );
    
    res.status(200).json({
      success: true,
      data: tutorsWithUploads,
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
    
    // 準備更新數據
    const updateData = {
      profileStatus: 'approved',
      remarks: remarks || ''
    };
    
    // 檢查是否有待審批的更新申請 (pendingProfile)
    if (tutor.pendingProfile && tutor.pendingProfile.status === 'pending') {
      console.log('🔍 發現待審批的更新申請，一併處理');
      
      // 合併pendingProfile的更新到主資料
      if (tutor.pendingProfile.name) {
        updateData.name = tutor.pendingProfile.name;
        console.log('📝 更新姓名:', tutor.pendingProfile.name);
      }
      if (tutor.pendingProfile.phone) {
        updateData.phone = tutor.pendingProfile.phone;
        console.log('📞 更新電話:', tutor.pendingProfile.phone);
      }
      if (tutor.pendingProfile.email) {
        updateData.email = tutor.pendingProfile.email;
        console.log('📧 更新電郵:', tutor.pendingProfile.email);
      }
      if (tutor.pendingProfile.tutorProfile) {
        updateData.tutorProfile = {
          ...tutor.tutorProfile,
          ...tutor.pendingProfile.tutorProfile
        };
        console.log('👨‍🏫 更新導師資料');
      }
      if (tutor.pendingProfile.documents) {
        updateData.documents = tutor.pendingProfile.documents;
        console.log('📄 更新文件');
      }
      
      // 更新pendingProfile狀態為已批准 - 修正更新語法
      updateData.pendingProfile = {
        ...tutor.pendingProfile,
        status: 'approved',
        adminRemarks: remarks || '與導師個人資料一併批准'
      };
      
      console.log('✅ 更新pendingProfile狀態為approved');
    }
    
    // 更新導師資料
    const updatedTutor = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    console.log('✅ 導師個人資料已批准:', updatedTutor.name);
    
    res.status(200).json({ 
      success: true,
      message: '已批准導師個人資料',
      data: {
        tutorId: updatedTutor._id,
        tutorName: updatedTutor.name,
        profileStatus: updatedTutor.profileStatus,
        remarks: updatedTutor.remarks,
        hasPendingProfileApproved: !!tutor.pendingProfile
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
    
    console.log('❌ 拒絕導師個人資料:', { id, remarks, body: req.body });
    
    // 驗證必要參數
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: '缺少導師 ID' 
      });
    }
    
    // 檢查是否提供了拒絕原因
    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: '拒絕時必須提供原因',
        message: '請填寫拒絕原因'
      });
    }
    
    const tutor = await User.findById(id);
    
    if (!tutor) {
      return res.status(404).json({ 
        success: false,
        error: '找不到導師',
        message: '找不到指定的導師資料'
      });
    }
    
    if (tutor.userType !== 'tutor') {
      return res.status(400).json({ 
        success: false,
        error: '該用戶不是導師',
        message: '只能拒絕導師類型的用戶'
      });
    }
    
    if (tutor.profileStatus !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: '該導師資料不在待審核狀態',
        message: `該導師資料狀態為 ${tutor.profileStatus}，無法拒絕`
      });
    }
    
    // 更新狀態為已拒絕
    tutor.profileStatus = 'rejected';
    tutor.remarks = remarks.trim();
    
    await tutor.save();
    
    console.log('❌ 導師個人資料已拒絕:', {
      tutorId: tutor._id,
      tutorName: tutor.name,
      profileStatus: tutor.profileStatus,
      remarks: tutor.remarks
    });
    
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