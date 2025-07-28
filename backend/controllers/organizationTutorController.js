const OrganizationTutor = require('../models/OrganizationTutor');
const OrganizationSubscription = require('../models/OrganizationSubscription');
const User = require('../models/User');

// 獲取機構的所有導師
const getOrganizationTutors = async (req, res) => {
  try {
    const organizationId = req.user.id;
    
    console.log('🔍 獲取機構導師列表:', organizationId);
    
    const tutors = await OrganizationTutor.find({ 
      organizationId,
      status: { $ne: 'inactive' }
    }).sort({ order: 1, createdAt: -1 });
    
    // 獲取訂閱信息
    const subscription = await OrganizationSubscription.findOne({ organizationId });
    
    const response = {
      success: true,
      data: {
        tutors,
        subscription: {
          currentTutors: tutors.length,
          maxIncludedTutors: subscription?.pricing?.includedTutors || 5,
          additionalTutorFee: subscription?.pricing?.additionalTutorFee || 50,
          monthlyFee: subscription?.calculateMonthlyFee() || 200,
          canAddMore: subscription?.canAddTutor() || false
        }
      }
    };
    
    console.log('✅ 獲取機構導師成功:', tutors.length);
    res.json(response);
    
  } catch (error) {
    console.error('❌ 獲取機構導師失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取導師列表失敗'
    });
  }
};

// 創建新的機構導師
const createOrganizationTutor = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const tutorData = req.body;
    
    console.log('🔍 創建機構導師:', { organizationId, tutorData });
    
    // 檢查機構用戶權限
    const organization = await User.findById(organizationId);
    if (!organization || organization.userType !== 'organization') {
      return res.status(403).json({
        success: false,
        message: '只有機構用戶可以創建導師'
      });
    }
    
    // 檢查訂閱狀態
    const subscription = await OrganizationSubscription.findOne({ organizationId });
    if (!subscription || !subscription.canAddTutor()) {
      return res.status(403).json({
        success: false,
        message: '訂閱已過期或暫停，無法添加導師'
      });
    }
    
    // 檢查當前導師數量
    const currentTutors = await OrganizationTutor.countDocuments({ 
      organizationId,
      status: { $ne: 'inactive' }
    });
    
    const maxIncluded = subscription.pricing.includedTutors;
    const additionalFee = subscription.pricing.additionalTutorFee;
    
    // 計算額外費用
    let additionalCost = 0;
    if (currentTutors >= maxIncluded) {
      additionalCost = additionalFee;
    }
    
    // 創建導師
    const newTutor = new OrganizationTutor({
      organizationId,
      tutorName: tutorData.tutorName,
      tutorEmail: tutorData.tutorEmail,
      tutorPhone: tutorData.tutorPhone,
      cv: tutorData.cv,
      order: currentTutors + 1
    });
    
    await newTutor.save();
    
    // 更新訂閱中的導師數量
    subscription.currentTutors = currentTutors + 1;
    await subscription.save();
    
    console.log('✅ 創建機構導師成功:', newTutor._id);
    
    res.json({
      success: true,
      message: '導師創建成功',
      data: {
        tutor: newTutor,
        additionalCost,
        monthlyFee: subscription.calculateMonthlyFee()
      }
    });
    
  } catch (error) {
    console.error('❌ 創建機構導師失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建導師失敗'
    });
  }
};

// 更新機構導師
const updateOrganizationTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const organizationId = req.user.id;
    const updateData = req.body;
    
    console.log('🔍 更新機構導師:', { tutorId, organizationId });
    
    const tutor = await OrganizationTutor.findOne({ 
      _id: tutorId,
      organizationId 
    });
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '導師不存在'
      });
    }
    
    // 更新導師信息
    Object.assign(tutor, updateData);
    await tutor.save();
    
    console.log('✅ 更新機構導師成功:', tutorId);
    
    res.json({
      success: true,
      message: '導師更新成功',
      data: tutor
    });
    
  } catch (error) {
    console.error('❌ 更新機構導師失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新導師失敗'
    });
  }
};

// 刪除機構導師
const deleteOrganizationTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const organizationId = req.user.id;
    
    console.log('🔍 刪除機構導師:', { tutorId, organizationId });
    
    const tutor = await OrganizationTutor.findOne({ 
      _id: tutorId,
      organizationId 
    });
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '導師不存在'
      });
    }
    
    // 軟刪除：設置為非活躍狀態
    tutor.status = 'inactive';
    await tutor.save();
    
    // 更新訂閱中的導師數量
    const subscription = await OrganizationSubscription.findOne({ organizationId });
    if (subscription) {
      subscription.currentTutors = Math.max(0, subscription.currentTutors - 1);
      await subscription.save();
    }
    
    console.log('✅ 刪除機構導師成功:', tutorId);
    
    res.json({
      success: true,
      message: '導師刪除成功',
      data: {
        monthlyFee: subscription?.calculateMonthlyFee() || 200
      }
    });
    
  } catch (error) {
    console.error('❌ 刪除機構導師失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除導師失敗'
    });
  }
};

// 切換導師公開狀態
const toggleTutorPublic = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const organizationId = req.user.id;
    
    console.log('🔍 切換導師公開狀態:', { tutorId, organizationId });
    
    const tutor = await OrganizationTutor.findOne({ 
      _id: tutorId,
      organizationId 
    });
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '導師不存在'
      });
    }
    
    tutor.isPublic = !tutor.isPublic;
    await tutor.save();
    
    console.log('✅ 切換導師公開狀態成功:', tutorId);
    
    res.json({
      success: true,
      message: `導師已${tutor.isPublic ? '公開' : '隱藏'}`,
      data: {
        isPublic: tutor.isPublic
      }
    });
    
  } catch (error) {
    console.error('❌ 切換導師公開狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '切換公開狀態失敗'
    });
  }
};

// 獲取機構訂閱信息
const getOrganizationSubscription = async (req, res) => {
  try {
    const organizationId = req.user.id;
    
    console.log('🔍 獲取機構訂閱信息:', organizationId);
    
    let subscription = await OrganizationSubscription.findOne({ organizationId });
    
    // 如果沒有訂閱，創建一個默認訂閱
    if (!subscription) {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      subscription = new OrganizationSubscription({
        organizationId,
        currentPeriod: {
          startDate: now,
          endDate: nextMonth
        },
        payment: {
          nextPaymentDate: nextMonth,
          amount: 200
        }
      });
      
      await subscription.save();
    }
    
    // 獲取當前導師數量
    const currentTutors = await OrganizationTutor.countDocuments({ 
      organizationId,
      status: { $ne: 'inactive' }
    });
    
    subscription.currentTutors = currentTutors;
    await subscription.save();
    
    console.log('✅ 獲取機構訂閱信息成功');
    
    res.json({
      success: true,
      data: {
        subscription,
        currentTutors,
        monthlyFee: subscription.calculateMonthlyFee(),
        canAddMore: subscription.canAddTutor()
      }
    });
    
  } catch (error) {
    console.error('❌ 獲取機構訂閱信息失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂閱信息失敗'
    });
  }
};

module.exports = {
  getOrganizationTutors,
  createOrganizationTutor,
  updateOrganizationTutor,
  deleteOrganizationTutor,
  toggleTutorPublic,
  getOrganizationSubscription
}; 