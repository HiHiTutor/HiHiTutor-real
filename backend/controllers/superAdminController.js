const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 創建超級管理員（只有超級管理員可以創建其他超級管理員）
const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 驗證必填欄位
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供所有必填欄位'
      });
    }

    // 檢查是否已存在相同email或phone的用戶
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '該email或電話號碼已被使用'
      });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建超級管理員
    const superAdmin = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      userType: 'super_admin',
      role: 'super_admin',
      status: 'active',
      isActive: true
    });

    await superAdmin.save();

    console.log('✅ Super Admin created:', {
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
      userType: superAdmin.userType
    });

    res.status(201).json({
      success: true,
      message: '超級管理員創建成功',
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        role: superAdmin.role,
        userType: superAdmin.userType,
        status: superAdmin.status
      }
    });

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    res.status(500).json({
      success: false,
      message: '創建超級管理員失敗'
    });
  }
};

// 獲取所有超級管理員
const getAllSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await User.find({
      role: 'super_admin'
    }).select('-password');

    res.json({
      success: true,
      data: superAdmins
    });

  } catch (error) {
    console.error('❌ Error getting super admins:', error);
    res.status(500).json({
      success: false,
      message: '獲取超級管理員列表失敗'
    });
  }
};

// 更新超級管理員
const updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 不允許通過此API更改角色或用戶類型
    delete updateData.role;
    delete updateData.userType;

    // 如果更新密碼，需要加密
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const superAdmin = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: '超級管理員不存在'
      });
    }

    res.json({
      success: true,
      message: '超級管理員更新成功',
      data: superAdmin
    });

  } catch (error) {
    console.error('❌ Error updating super admin:', error);
    res.status(500).json({
      success: false,
      message: '更新超級管理員失敗'
    });
  }
};

// 刪除超級管理員
const deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查是否為當前登入的超級管理員
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能刪除自己的帳號'
      });
    }

    const superAdmin = await User.findByIdAndDelete(id);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: '超級管理員不存在'
      });
    }

    res.json({
      success: true,
      message: '超級管理員刪除成功'
    });

  } catch (error) {
    console.error('❌ Error deleting super admin:', error);
    res.status(500).json({
      success: false,
      message: '刪除超級管理員失敗'
    });
  }
};

module.exports = {
  createSuperAdmin,
  getAllSuperAdmins,
  updateSuperAdmin,
  deleteSuperAdmin
}; 