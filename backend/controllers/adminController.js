const User = require('../models/User');
const UpgradeDocument = require('../models/UpgradeDocument');
const { validateUserUpdate } = require('../validators/userValidator');
const bcrypt = require('bcryptjs');
const StudentCase = require('../models/StudentCase');
const TutorCase = require('../models/TutorCase');
const connectDB = require('../config/db');

// User Management
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body;

    // 檢查郵箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 加密密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 創建新用戶
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      userType,
      status: 'active',
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

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error } = validateUserUpdate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 檢查是否嘗試將用戶升級為管理員
    if (req.body.userType === 'admin' || req.body.role === 'admin') {
      // 確保當前用戶是管理員
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || currentUser.userType !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Only administrators can create other administrators' 
        });
      }
    }

    const updateData = {
      ...req.body,
      // 如果設置為管理員，確保兩個字段都正確設置
      ...(req.body.userType === 'admin' ? { role: 'admin', status: 'active' } : {}),
      ...(req.body.role === 'admin' ? { userType: 'admin', status: 'active' } : {})
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

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
    const documents = await UpgradeDocument.find({ userId: req.params.id });
    res.json(documents);
  } catch (error) {
    console.error('Error getting upgrade documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const approveUserUpgrade = async (req, res) => {
  try {
    const { type } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          role: type,
          upgradeStatus: 'approved',
        },
      },
      { new: true }
    ).select('-password');

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          upgradeStatus: 'rejected',
          upgradeRejectionReason: reason,
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error rejecting user upgrade:', error);
    res.status(500).json({ message: 'Internal server error' });
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
        .sort({ createdAt: -1 });
      cases = cases.concat(studentCases.map(c => ({...c.toObject(), type: 'student'})));
      total += await StudentCase.countDocuments(query);
    }

    if (!type || type === 'tutor') {
      // Get tutor cases
      const tutorCases = await TutorCase.find(query)
        .sort({ createdAt: -1 });
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
    if (type === 'student') {
      case_ = await StudentCase.findOne({ $or: [{ _id: id }, { id: id }] }).lean();
    } else if (type === 'tutor') {
      case_ = await TutorCase.findOne({ $or: [{ _id: id }, { id: id }] }).lean();
    } else {
      // Try both collections if type is not specified
      case_ = await StudentCase.findOne({ $or: [{ _id: id }, { id: id }] }).lean() || 
              await TutorCase.findOne({ $or: [{ _id: id }, { id: id }] }).lean();
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
    const dateMatch = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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

module.exports = {
  // User Management
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  
  // Case Management
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  
  // Statistics
  getSubjectStats,
  getPlatformStats
}; 