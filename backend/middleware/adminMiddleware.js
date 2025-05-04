const userRepository = require('../repositories/UserRepository');

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userRepository.getUserById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '需要管理員權限' });
    }

    next();
  } catch (error) {
    console.error('❌ Admin 驗證錯誤：', error);
    res.status(500).json({ message: '驗證管理員身份失敗' });
  }
};

module.exports = { verifyAdmin }; 