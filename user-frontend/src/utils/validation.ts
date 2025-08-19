// 導師資料驗證工具函數

/**
 * 檢查文本是否包含聯絡資料模式
 * @param text 要檢查的文本
 * @returns 包含聯絡資料時返回true，否則返回false
 */
export const containsContactInfo = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  
  // 檢查連續5個或以上數字（電話號碼）
  if (/\d{5,}/.test(text)) {
    return true;
  }
  
  // 檢查@符號（電子郵件）
  if (lowerText.includes('@')) {
    return true;
  }
  
  // 檢查常見的聯絡方式關鍵詞
  const contactKeywords = [
    '電話', 'phone', 'tel', 'mobile', 'whatsapp', 'wechat', 'line', 'telegram',
    '電郵', 'email', '郵箱', '信箱', '聯絡', '聯繫', 'contact', 'qq', 'skype',
    '微信', 'qq號', 'qq群', '微信群', 'line群', 'telegram群'
  ];
  
  return contactKeywords.some(keyword => lowerText.includes(keyword));
};

/**
 * 檢查並清理文本，移除或替換聯絡資料
 * @param text 要清理的文本
 * @returns 清理後的文本
 */
export const sanitizeContactInfo = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  let sanitized = text;
  
  // 替換連續5個或以上數字為 [電話號碼已隱藏]
  sanitized = sanitized.replace(/\d{5,}/g, '[電話號碼已隱藏]');
  
  // 替換@符號為 [電子郵件已隱藏]
  sanitized = sanitized.replace(/@/g, '[電子郵件已隱藏]');
  
  // 替換常見聯絡方式關鍵詞
  const contactKeywords = [
    '電話', 'phone', 'tel', 'mobile', 'whatsapp', 'wechat', 'line', 'telegram',
    '電郵', 'email', '郵箱', '信箱', '聯絡', '聯繫', 'contact', 'qq', 'skype',
    '微信', 'qq號', 'qq群', '微信群', 'line群', 'telegram群'
  ];
  
  contactKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '[聯絡方式已隱藏]');
  });
  
  return sanitized;
};

/**
 * 驗證輸入字段，防止輸入聯絡資料
 * @param value 輸入值
 * @param fieldName 字段名稱
 * @returns 驗證結果對象
 */
export const validateField = (value: string, fieldName: string) => {
  if (!value) {
    return { isValid: true, message: '' };
  }
  
  if (containsContactInfo(value)) {
    return {
      isValid: false,
      message: `請勿在${fieldName}中包含聯絡資料，違反平台條款將導致帳號被停用`
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * 獲取聯絡資料警告信息
 * @returns 警告信息
 */
export const getContactInfoWarning = (): string => {
  return '⚠️ 重要提醒：如導師提供任何聯絡資料，即違反平台條款，帳號將被永久停用。';
};

/**
 * 檢查並阻止表單提交（如果包含聯絡資料）
 * @param formData 表單數據
 * @returns 檢查結果
 */
export const validateFormSubmission = (formData: Record<string, any>) => {
  const violations: string[] = [];
  
  // 檢查所有文本字段
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      if (containsContactInfo(value)) {
        violations.push(`${key}: 包含聯絡資料`);
      }
    } else if (Array.isArray(value)) {
      // 檢查數組中的字符串
      value.forEach((item, index) => {
        if (typeof item === 'string' && item.trim()) {
          if (containsContactInfo(item)) {
            violations.push(`${key}[${index}]: 包含聯絡資料`);
          }
        }
      });
    }
  });
  
  if (violations.length > 0) {
    return {
      isValid: false,
      violations,
      message: '表單包含聯絡資料，無法提交。請移除所有聯絡資料後重試。'
    };
  }
  
  return { isValid: true, violations: [], message: '' };
}; 