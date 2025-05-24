const User = require('../models/User');

class UserRepository {
  async getAllUsers() {
    try {
      return await User.find({});
    } catch (error) {
      console.error('[getAllUsers] 讀取用戶資料失敗:', error);
      return [];
    }
  }

  async getUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('[getUserByEmail] 查詢用戶失敗:', error);
      return null;
    }
  }

  async getUserByPhone(phone) {
    try {
      return await User.findOne({ phone });
    } catch (error) {
      console.error('[getUserByPhone] 查詢用戶失敗:', error);
      return null;
    }
  }

  async getUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('[getUserById] 查詢用戶失敗:', error);
      return null;
    }
  }

  async updateUser(updatedUser) {
    try {
      return await User.findByIdAndUpdate(
        updatedUser.id,
        { ...updatedUser, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('[updateUser] 更新用戶失敗:', error);
      return null;
    }
  }

  async saveUsers(users) {
    try {
      // 清空現有用戶
      await User.deleteMany({});
      // 批量插入新用戶
      await User.insertMany(users);
      return true;
    } catch (error) {
      console.error('[saveUsers] 保存用戶失敗:', error);
      return false;
    }
  }
}

module.exports = new UserRepository(); 