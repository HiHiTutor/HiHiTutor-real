import { RegisterFormData, User } from '@/types/auth';

// 定義全域變數的型別
declare global {
  var users: Map<string, User>;
}

// 使用全域變數儲存用戶資料
const users = global.users || new Map<string, User>();
if (!global.users) global.users = users;

// 使用 Set 儲存已註冊的電話號碼
const registeredPhones = new Set<string>();

// 生成用戶 ID
const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substring(2, 8)}`;
};

// 檢查電話是否已註冊
export const isPhoneRegistered = (phone: string): boolean => {
  return registeredPhones.has(phone);
};

// 註冊新用戶
export const registerUser = (data: RegisterFormData) => {
  const { token, name, password, email, userType, phone } = data;
  
  // 檢查電話是否已註冊
  if (isPhoneRegistered(phone)) {
    return {
      status: 'error',
      message: '此電話號碼已註冊'
    };
  }

  // 生成用戶資料
  const user: User = {
    id: generateUserId(),
    name,
    phone,
    email,
    password,
    userType,
    createdAt: Date.now()
  };

  // 儲存用戶資料
  users.set(user.id, user);
  registeredPhones.add(phone);

  console.log(`✅ 已儲存用戶：${email}`);

  return {
    status: 'success',
    message: '註冊成功',
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      userType: user.userType
    }
  };
}; 