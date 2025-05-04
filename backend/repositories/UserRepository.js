const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '../data/users.json');

class UserRepository {
  async getAllUsers() {
    try {
      const data = fs.readFileSync(usersPath, 'utf-8');
      const users = JSON.parse(data);
      return users.map(user => ({
        ...user,
        upgraded: user.upgraded ?? false,
        upgradeRequested: user.upgradeRequested ?? false,
        upgradeDocuments: user.upgradeDocuments ?? []
      }));
    } catch (error) {
      console.error('[getAllUsers] 讀取 users.json 失敗:', error);
      return [];
    }
  }

  async getUserByEmail(email) {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email);
  }

  async getUserByPhone(phone) {
    const users = await this.getAllUsers();
    return users.find(user => user.phone === phone);
  }

  async getUserById(id) {
    const users = await this.getAllUsers();
    return users.find(user => user.id === id);
  }

  async updateUser(updatedUser) {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    }
  }

  async saveUsers(users) {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
}

module.exports = new UserRepository(); 