const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

async function resetPasswords() {
  try {
    // 讀取用戶數據
    const data = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(data);

    // 更新每個用戶的密碼
    const updatedUsers = users.map((user) => {
      console.log(`重置用戶 ${user.email} 的密碼為 888888`);

      // 更新用戶資料
      return {
        ...user,
        password: '888888',
        // 確保所有用戶都有這些字段
        upgraded: user.upgraded ?? false,
        upgradeRequested: user.upgradeRequested ?? false,
        upgradeDocuments: user.upgradeDocuments ?? [],
        // 統一時間格式
        createdAt: typeof user.createdAt === 'string' 
          ? new Date(user.createdAt).getTime() 
          : user.createdAt
      };
    });

    // 保存更新後的用戶數據
    fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2));
    console.log('✅ 所有用戶密碼已重置為 888888');

  } catch (error) {
    console.error('❌ 密碼重置失敗:', error);
  }
}

// 執行重置
resetPasswords(); 