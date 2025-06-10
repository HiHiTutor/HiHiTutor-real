const User = require('../../../models/User');

// 更新用戶資料
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({ success: false, message: '請提供要更新的資料' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ success: true, message: '用戶資料已更新', user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType
    }});
  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    res.status(500).json({ success: false, message: '更新用戶資料時發生錯誤' });
  }
}; 