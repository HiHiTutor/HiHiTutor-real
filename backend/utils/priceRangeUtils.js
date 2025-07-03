// 價格範圍處理工具

// 定義價格範圍選項
const PRICE_RANGES = {
  'unlimited': { min: null, max: null, label: '不限' },
  '0-100': { min: 0, max: 100, label: 'HK$ 100 或以下' },
  '101-300': { min: 101, max: 300, label: 'HK$ 101 - HK$ 300' },
  '301-500': { min: 301, max: 500, label: 'HK$ 301 - HK$ 500' },
  '501-1000': { min: 501, max: 1000, label: 'HK$ 501 - HK$ 1,000' },
  '1001+': { min: 1001, max: null, label: 'HK$ 1,001 或以上' }
};

/**
 * 根據價格範圍代碼獲取價格範圍
 * @param {string} rangeCode - 價格範圍代碼
 * @returns {object} 價格範圍對象 { min, max, label }
 */
function getPriceRange(rangeCode) {
  return PRICE_RANGES[rangeCode] || PRICE_RANGES['unlimited'];
}

/**
 * 根據價格值判斷屬於哪個價格範圍
 * @param {number} price - 價格值
 * @returns {string} 價格範圍代碼
 */
function getPriceRangeCode(price) {
  if (!price || price <= 0) return 'unlimited';
  
  if (price <= 100) return '0-100';
  if (price <= 300) return '101-300';
  if (price <= 500) return '301-500';
  if (price <= 1000) return '501-1000';
  return '1001+';
}

/**
 * 從字符串中提取數字價格
 * @param {string} priceString - 價格字符串，如 "HK$ 92", "每堂 HK$ 101"
 * @returns {number} 提取的價格數字
 */
function extractPriceFromString(priceString) {
  if (!priceString || typeof priceString !== 'string') return null;
  
  // 匹配數字模式，支援各種格式
  const priceMatch = priceString.match(/(?:HK\$?\s*)?(\d+(?:\.\d+)?)/i);
  if (priceMatch) {
    return parseInt(priceMatch[1]);
  }
  
  return null;
}

/**
 * 構建MongoDB價格查詢條件
 * @param {string} rangeCode - 價格範圍代碼
 * @returns {object} MongoDB查詢條件
 */
function buildPriceQuery(rangeCode) {
  const range = getPriceRange(rangeCode);
  
  if (rangeCode === 'unlimited' || !range.min) {
    return {}; // 不限，不添加價格條件
  }
  
  const query = {};
  
  if (range.min !== null) {
    query.$gte = range.min;
  }
  
  if (range.max !== null) {
    query.$lte = range.max;
  }
  
  return query;
}

/**
 * 檢查價格是否在指定範圍內
 * @param {number} price - 要檢查的價格
 * @param {string} rangeCode - 價格範圍代碼
 * @returns {boolean} 是否在範圍內
 */
function isPriceInRange(price, rangeCode) {
  if (rangeCode === 'unlimited') return true;
  
  const range = getPriceRange(rangeCode);
  
  if (price < range.min) return false;
  if (range.max !== null && price > range.max) return false;
  
  return true;
}

/**
 * 處理多種價格字段格式
 * @param {object} item - 資料項目
 * @returns {number} 提取的價格
 */
function extractPriceFromItem(item) {
  // 嘗試多種可能的價格字段
  const priceFields = [
    'price',
    'pricePerLesson',
    'budget',
    'lessonDetails.pricePerLesson'
  ];
  
  for (const field of priceFields) {
    const value = getNestedValue(item, field);
    if (value) {
      const extracted = extractPriceFromString(value.toString());
      if (extracted) return extracted;
    }
  }
  
  return null;
}

/**
 * 獲取嵌套對象的值
 * @param {object} obj - 對象
 * @param {string} path - 路徑，如 'lessonDetails.pricePerLesson'
 * @returns {any} 值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

module.exports = {
  PRICE_RANGES,
  getPriceRange,
  getPriceRangeCode,
  extractPriceFromString,
  buildPriceQuery,
  isPriceInRange,
  extractPriceFromItem
}; 