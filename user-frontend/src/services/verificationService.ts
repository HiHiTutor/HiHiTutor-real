import { VerificationCode } from '../types/auth';

// 定義全域變數的型別
declare global {
  var verificationCodes: Map<string, VerificationCode>;
  var validRegisterTokens: Map<string, { phone: string; expiresAt: number; isUsed: boolean; createdAt: number }>;
}

// 使用全域變數儲存驗證碼
const verificationCodes = global.verificationCodes || new Map<string, VerificationCode>();
if (!global.verificationCodes) global.verificationCodes = verificationCodes;

// 使用全域變數儲存有效的註冊令牌
const validRegisterTokens = global.validRegisterTokens || new Map<string, { phone: string; expiresAt: number; isUsed: boolean; createdAt: number }>();
if (!global.validRegisterTokens) global.validRegisterTokens = validRegisterTokens;

// 生成 6 位數字驗證碼
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 檢查是否可以重新發送驗證碼
const canResendCode = (phoneNumber: string): boolean => {
  const existingCode = verificationCodes.get(phoneNumber);
  if (!existingCode) return true;
  
  const now = Date.now();
  const timeSinceLastCode = now - existingCode.createdAt;
  return timeSinceLastCode >= 90000; // 90 秒
};

// 檢查驗證碼是否有效
const isCodeValid = (code: VerificationCode): boolean => {
  const now = Date.now();
  const timeSinceCreation = now - code.createdAt;
  return timeSinceCreation <= 600000; // 10 分鐘
};

// 請求驗證碼
export const requestVerificationCode = (phoneNumber: string) => {
  if (!canResendCode(phoneNumber)) {
    return {
      message: '請稍後再試',
      retryAfter: 90,
      status: 'error'
    };
  }

  const code = generateVerificationCode();
  verificationCodes.set(phoneNumber, {
    code,
    phoneNumber,
    createdAt: Date.now(),
    isVerified: false
  });

  console.log(`📝 已儲存驗證碼：${code} 對應電話：${phoneNumber}`);

  return {
    message: '驗證碼已傳送',
    retryAfter: 90,
    status: 'success',
    code
  };
};

// 驗證碼驗證
export const verifyCode = (phoneNumber: string, code: string) => {
  const storedCode = verificationCodes.get(phoneNumber);
  const found = storedCode ? '找到' : '未找到';
  console.log(`🔍 查找驗證碼：${code}，結果：${found}`);
  
  if (!storedCode) {
    return {
      message: '驗證碼不存在',
      status: 'error'
    };
  }

  if (storedCode.isVerified) {
    return {
      message: '此驗證碼已被使用',
      status: 'error'
    };
  }

  if (!isCodeValid(storedCode)) {
    return {
      message: '驗證碼已過期',
      status: 'error'
    };
  }

  if (storedCode.code !== code) {
    return {
      message: '驗證碼錯誤',
      status: 'error'
    };
  }

  // 標記為已驗證
  storedCode.isVerified = true;
  verificationCodes.set(phoneNumber, storedCode);

  // 生成臨時令牌
  const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = Date.now() + 600000; // 10 分鐘後過期

  // 儲存令牌
  validRegisterTokens.set(token, {
    phone: phoneNumber,
    expiresAt,
    isUsed: false,
    createdAt: Date.now()
  });

  console.log("✅ 發出註冊令牌：", token, " 對應電話：", phoneNumber);
  console.log("🔍 tokenMap 目前內容：", [...validRegisterTokens.entries()]);

  return {
    message: '驗證成功',
    token,
    status: 'success'
  };
};

// 檢查令牌是否有效
export const isTokenValid = (token: string): boolean => {
  const tokenData = validRegisterTokens.get(token);
  if (!tokenData) {
    console.log("❌ 令牌不存在：", token);
    return false;
  }
  
  const now = Date.now();
  const isValid = now < tokenData.expiresAt && !tokenData.isUsed;
  
  if (!isValid) {
    console.log("❌ 令牌無效：", {
      token,
      isExpired: now >= tokenData.expiresAt,
      isUsed: tokenData.isUsed
    });
  }
  
  return isValid;
};

// 獲取令牌對應的電話號碼
export const getTokenPhone = (token: string): string | null => {
  const tokenData = validRegisterTokens.get(token);
  if (!tokenData) {
    console.log("❌ 無法獲取令牌對應的電話：", token);
    return null;
  }
  return tokenData.phone;
};

// 標記令牌為已使用
export const markTokenAsUsed = (token: string): void => {
  const tokenData = validRegisterTokens.get(token);
  if (tokenData) {
    tokenData.isUsed = true;
    validRegisterTokens.set(token, tokenData);
    console.log("✅ 令牌已標記為已使用：", token);
  }
};

// 清理過期的令牌
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of validRegisterTokens.entries()) {
    if (now >= data.expiresAt) {
      validRegisterTokens.delete(token);
    }
  }
}, 60000); // 每分鐘清理一次 