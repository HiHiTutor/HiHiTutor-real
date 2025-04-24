import { User } from '@/types/auth';

// 定義全域變數的型別
declare global {
  var users: Map<string, User>;
  var accessTokens: Map<string, { userId: string; expiresAt: number }>;
}

// 使用全域變數儲存用戶資料
const users = global.users || new Map<string, User>();
if (!global.users) global.users = users;

// 使用全域變數儲存有效的訪問令牌
const accessTokens = global.accessTokens || new Map<string, { userId: string; expiresAt: number }>();
if (!global.accessTokens) global.accessTokens = accessTokens;

// 生成訪問令牌
const generateAccessToken = (): string => {
  return `ACCESS-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
};

// 檢查帳號格式
const isEmail = (account: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
};

// 查找用戶
const findUser = (account: string): User | null => {
  console.log('🔍 開始搜尋用戶：', {
    account,
    isEmail: isEmail(account),
    totalUsers: users.size
  });

  // 遍歷所有用戶，檢查 email 或 phone
  for (const [userId, user] of users.entries()) {
    console.log('檢查用戶：', {
      userId,
      email: user.email,
      phone: user.phone,
      matches: user.email === account || user.phone === account
    });

    if (user.email === account || user.phone === account) {
      console.log('✅ 找到匹配用戶：', userId);
      return user;
    }
  }

  console.log('❌ 未找到匹配用戶');
  return null;
};

// 用戶登入
export const login = (account: string, password: string) => {
  console.log(`🔍 嘗試登入：${account}`);

  // 查找用戶
  const user = findUser(account);
  if (!user) {
    console.log('❌ 登入失敗：帳號不存在');
    return {
      status: 'error',
      message: '帳號或密碼錯誤'
    };
  }

  // 檢查密碼（目前是明文比較，之後可升級為雜湊）
  if (user.password !== password) {
    console.log('❌ 登入失敗：密碼錯誤');
    return {
      status: 'error',
      message: '帳號或密碼錯誤'
    };
  }

  // 生成訪問令牌
  const token = generateAccessToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 小時後過期

  // 儲存令牌
  accessTokens.set(token, {
    userId: user.id,
    expiresAt
  });

  console.log(`✅ 登入成功：${user.name}`);

  // 移除密碼後回傳用戶資料
  const { password: _, ...userWithoutPassword } = user;

  return {
    status: 'success',
    message: '登入成功',
    token,
    user: userWithoutPassword
  };
};

// 驗證訪問令牌
export const validateAccessToken = (token: string): User | null => {
  const tokenData = accessTokens.get(token);
  if (!tokenData) {
    console.log('❌ 令牌驗證失敗：令牌不存在');
    return null;
  }

  const now = Date.now();
  if (now >= tokenData.expiresAt) {
    console.log('❌ 令牌驗證失敗：令牌已過期');
    accessTokens.delete(token);
    return null;
  }

  const user = users.get(tokenData.userId);
  if (!user) {
    console.log('❌ 令牌驗證失敗：用戶不存在');
    accessTokens.delete(token);
    return null;
  }

  return user;
};

// 登出
export const logout = (token: string): void => {
  accessTokens.delete(token);
  console.log('✅ 登出成功');
};

// 清理過期的令牌
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of accessTokens.entries()) {
    if (now >= data.expiresAt) {
      accessTokens.delete(token);
    }
  }
}, 60000); // 每分鐘清理一次 