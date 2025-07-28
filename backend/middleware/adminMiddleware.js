const userRepository = require('../repositories/UserRepository');

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userRepository.getUserById(userId);

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      console.log('❌ Admin 驗證失敗:', {
        userId,
        hasUser: !!user,
        userRole: user?.role,
        userType: user?.userType
      });
      return res.status(403).json({ message: '需要管理員權限' });
    }

    console.log('✅ Admin 驗證成功:', {
      userId,
      userRole: user.role,
      userType: user.userType
    });

    next();
  } catch (error) {
    console.error('❌ Admin 驗證錯誤：', error);
    res.status(500).json({ message: '驗證管理員身份失敗' });
  }
};

const verifySuperAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userRepository.getUserById(userId);

    if (!user || user.role !== 'super_admin') {
      console.log('❌ Super Admin 驗證失敗:', {
        userId,
        hasUser: !!user,
        userRole: user?.role,
        userType: user?.userType
      });
      return res.status(403).json({ message: '需要超級管理員權限' });
    }

    console.log('✅ Super Admin 驗證成功:', {
      userId,
      userRole: user.role,
      userType: user.userType
    });

    next();
  } catch (error) {
    console.error('❌ Super Admin 驗證錯誤：', error);
    res.status(500).json({ message: '驗證超級管理員身份失敗' });
  }
};

module.exports = { verifyAdmin, verifySuperAdmin }; 