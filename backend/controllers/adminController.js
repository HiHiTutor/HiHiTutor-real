const User = require('../models/User');
const UpgradeDocument = require('../models/UpgradeDocument');
const { validateUserUpdate } = require('../validators/userValidator');
const bcrypt = require('bcryptjs');
const StudentCase = require('../models/StudentCase');
const TutorCase = require('../models/TutorCase');
const SearchLog = require('../models/SearchLog');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const { generateUniqueTutorId } = require('../utils/tutorUtils');

// 生成唯一 7 位 userId
async function generateUserId() {
  // 查找最大的有效 userId
  const lastUser = await User.findOne({
    userId: { 
      $exists: true,
      $not: { $regex: /NaN|null|undefined/ },
      $ne: '0000000'
    }
  }).sort({ userId: -1 });
  
  let newId = 1000001; // 默認起始值
  
  if (lastUser && lastUser.userId) {
    const parsedId = parseInt(lastUser.userId, 10);
    if (!isNaN(parsedId)) {
      newId = parsedId + 1;
    }
  }
  
  console.log(`🔢 Generated userId: ${newId.toString().padStart(7, '0')}`);
  return newId.toString().padStart(7, '0');
}
// 使用 generateUniqueTutorId 函數替代原有的 generateTutorId
async function generateTutorId() {
  return await generateUniqueTutorId(User);
}

// User Management
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, userType, tutorProfile } = req.body;

    // 檢查郵箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 自動產生不重複的 userId
    let nextUserId = '1000001';
    
    try {
      // 查找所有有效的數字 userId
      const allUsers = await User.find({
        userId: { 
          $exists: true,
          $ne: null,
          $ne: undefined,
          $regex: /^\d+$/
        }
      }).select('userId').lean();
      
      if (allUsers.length > 0) {
        // 找出最大的 userId
        const maxUserId = Math.max(...allUsers.map(user => parseInt(user.userId, 10)));
        if (!isNaN(maxUserId) && maxUserId > 0) {
          nextUserId = String(maxUserId + 1).padStart(7, '0');
        }
      }
    } catch (error) {
      console.error('Error generating userId:', error);
      // 如果出錯，使用預設值
    }
    
    console.log(`🔢 Generated userId: ${nextUserId}`);
    let tutorId = null;
    let orgId = null;
    let finalTutorProfile = undefined;

    if (userType === 'tutor') {
      tutorId = await generateTutorId();
      // 自動補齊必填欄位
      finalTutorProfile = {
        subjects: (tutorProfile && tutorProfile.subjects && tutorProfile.subjects.length > 0) ? tutorProfile.subjects : ['未指定'],
        sessionRate: (tutorProfile && tutorProfile.sessionRate) ? tutorProfile.sessionRate : 100,
        ...tutorProfile
      };
    }
    if (userType === 'organization') {
      orgId = 'O' + Date.now();
    }

    // 創建新用戶 - 密碼會由 User model 的 pre-save middleware 自動加密
    const user = new User({
      name,
      email,
      phone,
      password, // 明文密碼，讓 pre-save middleware 處理加密
      userType,
      status: 'active',
      userId: nextUserId,
      tutorId,
      orgId,
      ...(finalTutorProfile ? { tutorProfile: finalTutorProfile } : {})
    });

    await user.save();

    // 返回用戶信息（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 臨時測試端點：測試 userId 生成邏輯
const testUserIdGeneration = async (req, res) => {
  try {
    console.log('🧪 測試 userId 生成邏輯...');
    
    let nextUserId = '1000001';
    
    try {
      // 查找所有有效的數字 userId
      const allUsers = await User.find({
        userId: { 
          $exists: true,
          $ne: null,
          $ne: undefined,
          $regex: /^\d+$/
        }
      }).select('userId').lean();
      
      console.log('📊 找到的用戶數量:', allUsers.length);
      console.log('📋 所有 userId:', allUsers.map(user => user.userId));
      
      if (allUsers.length > 0) {
        // 找出最大的 userId
        const maxUserId = Math.max(...allUsers.map(user => parseInt(user.userId, 10)));
        console.log('🔢 最大 userId 數值:', maxUserId);
        
        if (!isNaN(maxUserId) && maxUserId > 0) {
          nextUserId = String(maxUserId + 1).padStart(7, '0');
        }
      }
    } catch (error) {
      console.error('Error generating userId:', error);
    }
    
    console.log(`🔢 生成的 userId: ${nextUserId}`);
    
    res.json({
      success: true,
      generatedUserId: nextUserId,
      message: 'userId 生成測試完成'
    });
  } catch (error) {
    console.error('Error in testUserIdGeneration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, userType, status, search, searchType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    // 使用 role 來過濾管理員
    if (role) {
      if (role === 'admin') {
        query.role = 'admin'; // admin 用戶的 role 是 'admin'
      }
    }

    // 使用 userType 來過濾用戶類型（student, tutor, organization）
    if (userType) {
      query.userType = userType;
    }
    
    if (status) query.status = status;
    
    // 根據搜尋類型構建搜尋條件
    if (search) {
      if (searchType && searchType !== 'all') {
        // 特定欄位搜尋
        switch (searchType) {
          case 'name':
            query.name = { $regex: search, $options: 'i' };
            break;
          case 'email':
            query.email = { $regex: search, $options: 'i' };
            break;
          case 'phone':
            query.phone = { $regex: search, $options: 'i' };
            break;
          case 'tutorId':
            query.tutorId = { $regex: search, $options: 'i' };
            break;
          case 'userId':
            query.userId = { $regex: search, $options: 'i' };
            break;
          default:
            // 如果是不認識的搜尋類型，使用全部欄位搜尋
            query.$or = [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { phone: { $regex: search, $options: 'i' } },
              { tutorId: { $regex: search, $options: 'i' } },
              { userId: { $regex: search, $options: 'i' } },
            ];
        }
      } else {
        // 全部欄位搜尋
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { tutorId: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } },
        ];
      }
    }

    // 驗證排序欄位
    const allowedSortFields = ['userId', 'name', 'email', 'phone', 'role', 'userType', 'tutorId', 'status', 'createdAt', 'isVip', 'isTop', 'rating'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = sortOrder === 'asc' ? 1 : -1;

    console.log('🔍 用戶查詢參數:', {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      userType,
      status,
      search,
      searchType,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
      query
    });

    const users = await User.find(query)
      .sort({ [validSortBy]: validSortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    console.log('📊 用戶查詢結果:', {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      returnedUsers: users.length,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
      query
    });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user;

    // 檢查是否為 MongoDB ObjectId 格式
    if (mongoose.Types.ObjectId.isValid(id)) {
      // 如果是 ObjectId 格式，直接用 _id 查詢
      user = await User.findById(id).select('-password').lean();
    } else {
      // 如果不是 ObjectId 格式，假設是 userId，用 userId 欄位查詢
      user = await User.findOne({ userId: id }).select('-password').lean();
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ 找到用戶:', {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email
    });

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error } = validateUserUpdate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 檢查是否嘗試將用戶升級為管理員
    if (req.body && (req.body.userType === 'admin' || req.body.role === 'admin')) {
      // 確保當前用戶是管理員或超級管理員
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || (currentUser.userType !== 'admin' && currentUser.userType !== 'super_admin')) {
        return res.status(403).json({ 
          success: false,
          message: 'Only administrators can create other administrators' 
        });
      }
    }

    // 檢查是否嘗試將用戶升級為超級管理員
    if (req.body && (req.body.userType === 'super_admin' || req.body.role === 'super_admin')) {
      // 只有超級管理員可以創建其他超級管理員
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || currentUser.userType !== 'super_admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Only super administrators can create other super administrators' 
        });
      }
    }

    const updateData = {
      ...req.body,
      // 如果設置為管理員，確保兩個字段都正確設置
      ...(req.body && req.body.userType === 'admin' ? { role: 'admin', status: 'active' } : {}),
      ...(req.body && req.body.role === 'admin' ? { userType: 'admin', status: 'active' } : {}),
      // 如果設置為超級管理員，確保兩個字段都正確設置
      ...(req.body && req.body.userType === 'super_admin' ? { role: 'super_admin', status: 'active' } : {}),
      ...(req.body && req.body.role === 'super_admin' ? { userType: 'super_admin', status: 'active' } : {})
    };

    // 支援通過 userId 或 MongoDB _id 查找用戶
    let user;
    const { id } = req.params;
    
    // 檢查是否為 MongoDB ObjectId 格式
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // 如果是 MongoDB ObjectId，直接使用
      user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).select('-password');
    } else {
      // 如果不是 ObjectId，假設是 userId
      user = await User.findOneAndUpdate(
        { userId: id },
        { $set: updateData },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ 用戶更新成功:', {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      userType: user.userType
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const getUserUpgradeDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 支援通過 userId 或 MongoDB _id 查找升級文件
    let documents;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // 如果是 MongoDB ObjectId，先找到用戶的 userId
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      documents = await UpgradeDocument.find({ userId: user.userId });
    } else {
      // 如果不是 ObjectId，假設是 userId
      documents = await UpgradeDocument.find({ userId: id });
    }
    
    res.json(documents);
  } catch (error) {
    console.error('Error getting upgrade documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const approveUserUpgrade = async (req, res) => {
  try {
    const { type } = req.body;
    const { id } = req.params;
    
    // 支援通過 userId 或 MongoDB _id 查找用戶
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // 如果是 MongoDB ObjectId，直接使用
      user = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            role: type,
            upgradeStatus: 'approved',
          },
        },
        { new: true }
      ).select('-password');
    } else {
      // 如果不是 ObjectId，假設是 userId
      user = await User.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            role: type,
            upgradeStatus: 'approved',
          },
        },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error approving user upgrade:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const rejectUserUpgrade = async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;
    
    // 支援通過 userId 或 MongoDB _id 查找用戶
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // 如果是 MongoDB ObjectId，直接使用
      user = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            upgradeStatus: 'rejected',
            upgradeRejectionReason: reason,
          },
        },
        { new: true }
      ).select('-password');
    } else {
      // 如果不是 ObjectId，假設是 userId
      user = await User.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            upgradeStatus: 'rejected',
            upgradeRejectionReason: reason,
          },
        },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error rejecting user upgrade:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 批准機構用戶
const approveOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✅ 批准機構用戶:', id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    if (user.userType !== 'organization') {
      return res.status(400).json({
        success: false,
        message: '只能批准機構用戶'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能批准待審核的機構用戶'
      });
    }

    // 生成ORGID
    const orgId = 'ORG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // 更新用戶狀態
    user.status = 'active';
    user.organizationProfile = {
      ...user.organizationProfile,
      orgId: orgId
    };

    await user.save();

    console.log('✅ 機構用戶批准成功:', {
      userId: user.userId,
      name: user.name,
      orgId: orgId
    });

    res.json({
      success: true,
      message: '機構用戶批准成功',
      data: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        status: user.status,
        orgId: orgId
      }
    });
  } catch (error) {
    console.error('❌ 批准機構用戶失敗:', error);
    res.status(500).json({
      success: false,
      message: '批准機構用戶時發生錯誤'
    });
  }
};

// 拒絕機構用戶
const rejectOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('❌ 拒絕機構用戶:', id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    if (user.userType !== 'organization') {
      return res.status(400).json({
        success: false,
        message: '只能拒絕機構用戶'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能拒絕待審核的機構用戶'
      });
    }

    // 更新用戶狀態為拒絕
    user.status = 'banned';
    await user.save();

    console.log('✅ 機構用戶拒絕成功:', {
      userId: user.userId,
      name: user.name
    });

    res.json({
      success: true,
      message: '機構用戶拒絕成功',
      data: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ 拒絕機構用戶失敗:', error);
    res.status(500).json({
      success: false,
      message: '拒絕機構用戶時發生錯誤'
    });
  }
};

// 刪除用戶 - 只有超級管理員可以執行
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 檢查當前用戶是否為超級管理員
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超級管理員可以刪除用戶'
      });
    }

    // 檢查是否嘗試刪除自己
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能刪除自己的帳號'
      });
    }

    // 支援通過 userId 或 MongoDB _id 查找用戶
    let userToDelete;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // 如果是 MongoDB ObjectId，直接使用
      userToDelete = await User.findById(id);
    } else {
      // 如果不是 ObjectId，假設是 userId
      userToDelete = await User.findOne({ userId: id });
    }

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    // 檢查是否嘗試刪除其他超級管理員
    if (userToDelete.role === 'super_admin' && userToDelete._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '不能刪除其他超級管理員'
      });
    }

    // 記錄刪除操作
    console.log('🗑️ 用戶刪除操作:', {
      deletedBy: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      },
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role,
        userType: userToDelete.userType
      },
      reason: reason || '未提供原因',
      timestamp: new Date().toISOString()
    });

    // 執行刪除操作
    await User.findByIdAndDelete(userToDelete._id);

    res.json({
      success: true,
      message: '用戶刪除成功',
      data: {
        deletedUserId: userToDelete._id,
        deletedUserName: userToDelete.name,
        deletedUserEmail: userToDelete.email,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 刪除用戶失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除用戶失敗',
      error: error.message
    });
  }
};

// Case Management
const createCase = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      type,
      student,
      tutor,
      category,
      subCategory,
      subjects,
      regions,
      subRegions,
      budget,
      mode,
      experience,
    } = req.body;

    const caseData = {
      title,
      description,
      subject,
      student,
      tutor,
      category,
      subCategory,
      subjects,
      regions,
      subRegions,
      budget,
      mode,
      experience,
      status: 'open',
    };

    let newCase;
    if (type === 'student') {
      newCase = new StudentCase(caseData);
    } else if (type === 'tutor') {
      newCase = new TutorCase(caseData);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid case type. Must be either "student" or "tutor".'
      });
    }

    await newCase.save();

    res.status(201).json({
      success: true,
      data: newCase,
    });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllCases = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let cases = [];
    let total = 0;

    if (!type || type === 'student') {
      // Get student cases
      const studentCases = await StudentCase.find(query)
        .sort({ createdAt: -1 })
        .populate('studentId', 'name email userId');
      cases = cases.concat(studentCases.map(c => ({...c.toObject(), type: 'student'})));
      total += await StudentCase.countDocuments(query);
    }

    if (!type || type === 'tutor') {
      // Get tutor cases
      const tutorCases = await TutorCase.find(query)
        .sort({ createdAt: -1 })
        .populate('student', 'name email userId');
      cases = cases.concat(tutorCases.map(c => ({...c.toObject(), type: 'tutor'})));
      total += await TutorCase.countDocuments(query);
    }

    // Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCases = cases.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        cases: paginatedCases,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting cases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      data: null
    });
  }
};

const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    let case_;
    const query = { id: id }; // 首先嘗試使用 id 字段

    if (type === 'student') {
      case_ = await StudentCase.findOne(query).lean();
      if (case_) case_.type = 'student';
    } else if (type === 'tutor') {
      case_ = await TutorCase.findOne(query).lean();
      if (case_) case_.type = 'tutor';
    } else {
      // Try both collections if type is not specified
      case_ = await StudentCase.findOne(query).lean();
      if (case_) {
        case_.type = 'student';
      } else {
        case_ = await TutorCase.findOne(query).lean();
        if (case_) case_.type = 'tutor';
      }
    }

    // 如果找不到，嘗試使用 _id（如果是有效的 ObjectId）
    if (!case_ && /^[0-9a-fA-F]{24}$/.test(id)) {
      const idQuery = { _id: id };
      if (type === 'student') {
        case_ = await StudentCase.findOne(idQuery).lean();
        if (case_) case_.type = 'student';
      } else if (type === 'tutor') {
        case_ = await TutorCase.findOne(idQuery).lean();
        if (case_) case_.type = 'tutor';
      } else {
        case_ = await StudentCase.findOne(idQuery).lean();
        if (case_) {
          case_.type = 'student';
        } else {
          case_ = await TutorCase.findOne(idQuery).lean();
          if (case_) case_.type = 'tutor';
        }
      }
    }

    if (!case_) {
      return res.status(404).json({ 
        success: false,
        message: 'Case not found' 
      });
    }

    res.json({
      success: true,
      data: {
        case: case_
      }
    });
  } catch (error) {
    console.error('Error getting case:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const updateData = req.body;

    let case_;
    if (type === 'student') {
      case_ = await StudentCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: updateData },
        { new: true }
      ).lean();
    } else if (type === 'tutor') {
      case_ = await TutorCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: updateData },
        { new: true }
      ).lean();
    } else {
      // Try both collections if type is not specified
      case_ = await StudentCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: updateData },
        { new: true }
      ).lean() ||
      await TutorCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: updateData },
        { new: true }
      ).lean();
    }

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      data: case_
    });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const { status } = req.body;

    let case_;
    if (type === 'student') {
      case_ = await StudentCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean();
    } else if (type === 'tutor') {
      case_ = await TutorCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean();
    } else {
      // Try both collections if type is not specified
      case_ = await StudentCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean() ||
      await TutorCase.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean();
    }

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      data: case_
    });
  } catch (error) {
    console.error('Error updating case status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updatePromotionLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const { level } = req.body;

    let case_;
    if (type === 'student') {
      case_ = await StudentCase.findByIdAndUpdate(
        id,
        {
          $set: {
            promotionLevel: level,
            updatedAt: new Date()
          }
        },
        { new: true }
      ).lean();
    } else if (type === 'tutor') {
      case_ = await TutorCase.findByIdAndUpdate(
        id,
        {
          $set: {
            promotionLevel: level,
            updatedAt: new Date()
          }
        },
        { new: true }
      ).lean();
    } else {
      // Try both collections if type is not specified
      case_ = await StudentCase.findByIdAndUpdate(
        id,
        {
          $set: {
            promotionLevel: level,
            updatedAt: new Date()
          }
        },
        { new: true }
      ).lean() ||
      await TutorCase.findByIdAndUpdate(
        id,
        {
          $set: {
            promotionLevel: level,
            updatedAt: new Date()
          }
        },
        { new: true }
      ).lean();
    }

    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json({
      success: true,
      data: case_
    });
  } catch (error) {
    console.error('Error updating promotion level:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Statistics
const getSubjectStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 設置默認日期範圍（如果沒有提供）
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1); // 默認查詢過去一個月
    
    const dateMatch = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : defaultStartDate,
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    // Get stats from both collections
    const [studentStats, tutorStats] = await Promise.all([
      StudentCase.aggregate([
        { $match: dateMatch },
        { $unwind: '$subjects' },
        {
          $group: {
            _id: '$subjects',
            count: { $sum: 1 },
            studentCount: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] },
            },
          },
        },
      ]),
      TutorCase.aggregate([
        { $match: dateMatch },
        { $unwind: '$subjects' },
        {
          $group: {
            _id: '$subjects',
            count: { $sum: 1 },
            tutorCount: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Combine stats
    const combinedStats = {};
    studentStats.forEach(stat => {
      combinedStats[stat._id] = {
        subject: stat._id,
        searchCount: stat.count,
        studentCount: stat.studentCount,
        tutorCount: 0,
        successCount: stat.successCount,
      };
    });

    tutorStats.forEach(stat => {
      if (combinedStats[stat._id]) {
        combinedStats[stat._id].searchCount += stat.count;
        combinedStats[stat._id].tutorCount = stat.tutorCount;
        combinedStats[stat._id].successCount += stat.successCount;
      } else {
        combinedStats[stat._id] = {
          subject: stat._id,
          searchCount: stat.count,
          studentCount: 0,
          tutorCount: stat.tutorCount,
          successCount: stat.successCount,
        };
      }
    });

    const stats = Object.values(combinedStats).map(stat => ({
      ...stat,
      successRate: (stat.successCount / stat.searchCount) * 100,
    }));

    res.json(stats);
  } catch (error) {
    console.error('Error getting subject statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    console.log('Fetching platform statistics...');
    
    const [userStats, studentCaseStats, tutorCaseStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            students: {
              $sum: { $cond: [{ $eq: ['$userType', 'student'] }, 1, 0] },
            },
            tutors: {
              $sum: { $cond: [{ $eq: ['$userType', 'tutor'] }, 1, 0] },
            },
            institutions: {
              $sum: { $cond: [{ $eq: ['$userType', 'organization'] }, 1, 0] },
            },
          },
        },
      ]),
      StudentCase.aggregate([
        {
          $group: {
            _id: null,
            totalCases: { $sum: 1 },
            openCases: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
            },
            matchedCases: {
              $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] },
            },
          },
        },
      ]),
      TutorCase.aggregate([
        {
          $group: {
            _id: null,
            totalCases: { $sum: 1 },
            openCases: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
            },
            matchedCases: {
              $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const defaultStats = { totalCases: 0, openCases: 0, matchedCases: 0 };
    const sStats = studentCaseStats[0] || defaultStats;
    const tStats = tutorCaseStats[0] || defaultStats;

    const combinedCaseStats = {
      totalCases: sStats.totalCases + tStats.totalCases,
      openCases: sStats.openCases + tStats.openCases,
      matchedCases: sStats.matchedCases + tStats.matchedCases,
      studentCases: sStats.totalCases,
      tutorCases: tStats.totalCases,
    };

    console.log('User stats:', userStats[0] || { totalUsers: 0, students: 0, tutors: 0, institutions: 0 });
    console.log('Case stats:', combinedCaseStats);

    res.json({
      success: true,
      data: {
        users: userStats[0] || { totalUsers: 0, students: 0, tutors: 0, institutions: 0 },
        cases: combinedCaseStats,
      }
    });
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 獲取搜尋統計數據
const getSearchStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // 設置默認日期範圍（如果沒有提供）
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1); // 默認查詢過去一個月
    
    const dateMatch = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : defaultStartDate,
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    // 統計搜尋科目頻率
    const subjectSearchStats = await SearchLog.aggregate([
      { $match: dateMatch },
      { $unwind: '$subjects' },
      {
        $group: {
          _id: '$subjects',
          searchCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgResultsCount: { $avg: { $add: ['$resultsCount.tutors', '$resultsCount.cases'] } }
        }
      },
      {
        $project: {
          subject: '$_id',
          searchCount: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          avgResultsCount: { $round: ['$avgResultsCount', 2] }
        }
      },
      { $sort: { searchCount: -1 } }
    ]);

    // 統計搜尋類型分布
    const searchTypeStats = await SearchLog.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$searchType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          searchType: '$_id',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 統計每日搜尋趨勢
    const dailySearchTrend = await SearchLog.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === 'hour' ? '%Y-%m-%d-%H' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          searchCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          date: '$_id',
          searchCount: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 統計熱門搜尋關鍵字
    const popularKeywords = await SearchLog.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: '$searchQuery',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          keyword: '$_id',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: {
        subjectSearchStats,
        searchTypeStats,
        dailySearchTrend,
        popularKeywords,
        summary: {
          totalSearches: subjectSearchStats.reduce((sum, stat) => sum + stat.searchCount, 0),
          totalUniqueUsers: new Set(subjectSearchStats.flatMap(stat => stat.uniqueUsers)).size,
          topSubject: subjectSearchStats[0]?.subject || '無數據',
          topKeyword: popularKeywords[0]?.keyword || '無數據'
        }
      }
    });
  } catch (error) {
    console.error('Error getting search statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 獲取成功配對統計
const getMatchingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    const dateMatch = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : defaultStartDate,
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    // 統計成功配對的科目頻率
    const [studentCaseMatches, tutorCaseMatches] = await Promise.all([
      StudentCase.aggregate([
        { $match: { ...dateMatch, status: 'matched' } },
        { $unwind: '$subjects' },
        {
          $group: {
            _id: '$subjects',
            matchCount: { $sum: 1 },
            avgBudget: { $avg: '$budget' },
            avgResponseTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
          }
        },
        {
          $project: {
            subject: '$_id',
            matchCount: 1,
            avgBudget: { $round: ['$avgBudget', 2] },
            avgResponseTimeHours: { $round: [{ $divide: ['$avgResponseTime', 3600000] }, 2] }
          }
        },
        { $sort: { matchCount: -1 } }
      ]),
      TutorCase.aggregate([
        { $match: { ...dateMatch, status: 'matched' } },
        { $unwind: '$subjects' },
        {
          $group: {
            _id: '$subjects',
            matchCount: { $sum: 1 },
            avgPrice: { $avg: '$lessonDetails.pricePerLesson' },
            avgResponseTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
          }
        },
        {
          $project: {
            subject: '$_id',
            matchCount: 1,
            avgPrice: { $round: ['$avgPrice', 2] },
            avgResponseTimeHours: { $round: [{ $divide: ['$avgResponseTime', 3600000] }, 2] }
          }
        },
        { $sort: { matchCount: -1 } }
      ])
    ]);

    // 合併統計數據
    const combinedMatchStats = {};
    
    studentCaseMatches.forEach(stat => {
      combinedMatchStats[stat.subject] = {
        subject: stat.subject,
        studentMatchCount: stat.matchCount,
        tutorMatchCount: 0,
        totalMatchCount: stat.matchCount,
        avgBudget: stat.avgBudget,
        avgPrice: 0,
        avgResponseTimeHours: stat.avgResponseTimeHours
      };
    });

    tutorCaseMatches.forEach(stat => {
      if (combinedMatchStats[stat.subject]) {
        combinedMatchStats[stat.subject].tutorMatchCount = stat.matchCount;
        combinedMatchStats[stat.subject].totalMatchCount += stat.matchCount;
        combinedMatchStats[stat.subject].avgPrice = stat.avgPrice;
      } else {
        combinedMatchStats[stat.subject] = {
          subject: stat.subject,
          studentMatchCount: 0,
          tutorMatchCount: stat.matchCount,
          totalMatchCount: stat.matchCount,
          avgBudget: 0,
          avgPrice: stat.avgPrice,
          avgResponseTimeHours: stat.avgResponseTimeHours
        };
      }
    });

    const matchStats = Object.values(combinedMatchStats).sort((a, b) => b.totalMatchCount - a.totalMatchCount);

    res.json({
      success: true,
      data: {
        matchStats,
        summary: {
          totalMatches: matchStats.reduce((sum, stat) => sum + stat.totalMatchCount, 0),
          topMatchingSubject: matchStats[0]?.subject || '無數據',
          avgResponseTime: matchStats.length > 0 ? 
            matchStats.reduce((sum, stat) => sum + stat.avgResponseTimeHours, 0) / matchStats.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting matching statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// 獲取管理員通知數據
const getAdminNotifications = async (req, res) => {
  try {
    console.log('🔔 獲取管理員通知數據...');
    
    // 獲取各種待處理的事務數量
    const [
      pendingTutorProfiles,
      pendingTutorApplications,
      pendingUserUpgrades,
      openCases
    ] = await Promise.all([
      // 待審核的導師個人資料
      User.countDocuments({ 
        userType: 'tutor', 
        profileStatus: 'pending' 
      }),
      
      // 待審核的導師申請
      User.countDocuments({ 
        userType: 'student',
        upgradeRequested: true,
        userType: { $ne: 'tutor' }
      }),
      
      // 待升級的用戶
      User.countDocuments({ 
        upgradeRequested: true,
        userType: { $ne: 'tutor' }
      }),
      
      // 開放的案例
      Promise.all([
        StudentCase.countDocuments({ status: 'open' }),
        TutorCase.countDocuments({ status: 'open' })
      ]).then(([studentCases, tutorCases]) => studentCases + tutorCases)
    ]);
    
    const totalNotifications = pendingTutorProfiles + pendingTutorApplications + pendingUserUpgrades + openCases;
    
    console.log('📊 通知統計:', {
      pendingTutorProfiles,
      pendingTutorApplications,
      pendingUserUpgrades,
      openCases,
      totalNotifications
    });
    
    res.json({
      success: true,
      data: {
        total: totalNotifications,
        pendingTutorProfiles,
        pendingTutorApplications,
        pendingUserUpgrades,
        openCases,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ 獲取通知數據失敗:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

module.exports = {
  // User Management
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  approveOrganization,
  rejectOrganization,
  
  // Case Management
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  
  // Statistics
  getSubjectStats,
  getPlatformStats,
  getSearchStats,
  getMatchingStats,
  
  // Notifications
  getAdminNotifications
}; 