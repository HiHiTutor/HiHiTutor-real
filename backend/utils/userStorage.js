const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, '../data/users.json');

function loadUsers() {
  if (!fs.existsSync(userFilePath)) return [];
  const raw = fs.readFileSync(userFilePath);
  return JSON.parse(raw);
}

function getUserById(id) {
  const users = loadUsers();
  return users.find((u) => u.id === id);
}

module.exports = { loadUsers, getUserById }; 