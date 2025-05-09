const { loadUsers } = require('../utils/userStorage');

const loginUser = (req, res) => {
  // 登入邏輯
};

const register = (req, res) => {
  // 註冊邏輯
};

const getUserProfile = (req, res) => {
  // 獲取用戶資料邏輯
};

const getCurrentUser = (req, res) => {
  // 獲取當前用戶邏輯
};

const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '請提供註冊用的電郵地址' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: '查無此電郵帳戶' });
  }

  // 模擬發送密碼重設信
  return res.status(200).json({ message: '密碼重設連結已發送（模擬）' });
};

module.exports = {
  loginUser,
  register,
  getUserProfile,
  getCurrentUser,
  forgotPassword
}; 