const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

// 載入用戶資料
function loadUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.log('[⚠️] 無法載入用戶資料，使用空陣列');
    return [];
  }
}

// 儲存用戶資料
function saveUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('[✅] 用戶資料已儲存');
  } catch (e) {
    console.error('[❌] 儲存用戶資料失敗:', e);
  }
}

module.exports = {
  loadUsers,
  saveUsers
}; 