/**
 * 計算年齡的工具函數
 */

/**
 * 根據出生日期計算年齡
 * @param birthDate 出生日期，可以是 Date 對象或 ISO 字符串
 * @returns 年齡（數字）或 null（如果無法計算）
 */
export function calculateAge(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) {
    return null;
  }

  try {
    // 將輸入轉換為 Date 對象
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    // 檢查日期是否有效
    if (isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // 如果今年的生日還沒到，年齡減1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('計算年齡時發生錯誤:', error);
    return null;
  }
}

/**
 * 格式化年齡顯示
 * @param age 年齡數字
 * @returns 格式化的年齡字符串
 */
export function formatAge(age: number | null): string {
  if (age === null) {
    return '未知';
  }
  
  if (age < 0) {
    return '未知';
  }
  
  return `${age} 歲`;
}
