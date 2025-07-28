const userRepository = require('../repositories/UserRepository');

const verifyAdmin = async (req, res, next) => {
  try {
    console.log('🔍 Admin middleware 開始驗證...');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.user?.id:', req.user?.id);
    
    // 檢查是否有用戶信息
    if (!req.user) {
      console.log('❌ Admin 驗證失敗: 沒有用戶信息');
      return res.status(401).json({ message: '未登入' });
    }
    
    const userId = req.user.id || req.user._id;
    console.log('🔍 提取的 userId:', userId);
    
    if (!userId) {
      console.log('❌ Admin 驗證失敗: 沒有用戶ID');
      return res.status(401).json({ message: '無效的用戶信息' });
    }
    
    const user = await userRepository.getUserById(userId);

    console.log('🔍 查詢到的用戶:', {
      hasUser: !!user,
      userId: user?._id,
      userRole: user?.role,
      userType: user?.userType
    });

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