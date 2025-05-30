const User = require('../models/User');
const Case = require('../models/Case');
const UpgradeDocument = require('../models/UpgradeDocument');
const { validateUserUpdate } = require('../validators/userValidator');

// User Management
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
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
const getAllCases = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await Case.find(query)
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Case.countDocuments(query);

    res.json({
      cases,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error getting cases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCaseById = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(case_);
  } catch (error) {
    console.error('Error getting case:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCase = async (req, res) => {
  try {
    const case_ = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('userId', 'name email');

    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(case_);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { status, matchedUserId } = req.body;
    const case_ = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          matchedUserId,
          matchedAt: status === 'matched' ? new Date() : null,
        },
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(case_);
  } catch (error) {
    console.error('Error updating case status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePromotionLevel = async (req, res) => {
  try {
    const { level } = req.body;
    const case_ = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          promotionLevel: level,
          promotionUpdatedAt: new Date(),
        },
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(case_);
  } catch (error) {
    console.error('Error updating promotion level:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Statistics
const getSubjectStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await Case.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $unwind: '$subjects',
      },
      {
        $group: {
          _id: '$subjects',
          count: { $sum: 1 },
          studentCount: {
            $sum: { $cond: [{ $eq: ['$type', 'student'] }, 1, 0] },
          },
          tutorCount: {
            $sum: { $cond: [{ $eq: ['$type', 'tutor'] }, 1, 0] },
          },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          subject: '$_id',
          searchCount: '$count',
          studentCount: 1,
          tutorCount: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successCount', '$count'] },
              100,
            ],
          },
        },
      },
      {
        $sort: { searchCount: -1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error getting subject statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    console.log('Fetching platform statistics...');
    
    const [userStats, caseStats] = await Promise.all([
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
      Case.aggregate([
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
            studentCases: {
              $sum: { $cond: [{ $eq: ['$type', 'student'] }, 1, 0] },
            },
            tutorCases: {
              $sum: { $cond: [{ $eq: ['$type', 'tutor'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    console.log('User stats:', userStats[0] || { totalUsers: 0, students: 0, tutors: 0, institutions: 0 });
    console.log('Case stats:', caseStats[0] || { totalCases: 0, openCases: 0, matchedCases: 0, studentCases: 0, tutorCases: 0 });

    res.json({
      users: userStats[0] || { totalUsers: 0, students: 0, tutors: 0, institutions: 0 },
      cases: caseStats[0] || { totalCases: 0, openCases: 0, matchedCases: 0, studentCases: 0, tutorCases: 0 },
    });
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  getUserUpgradeDocuments,
  approveUserUpgrade,
  rejectUserUpgrade,
  
  // Case Management
  getAllCases,
  getCaseById,
  updateCase,
  updateCaseStatus,
  updatePromotionLevel,
  
  // Statistics
  getSubjectStats,
  getPlatformStats
}; 