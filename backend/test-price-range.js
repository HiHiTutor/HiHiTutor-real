const { 
  getPriceRange, 
  getPriceRangeCode, 
  extractPriceFromString, 
  buildPriceQuery, 
  isPriceInRange,
  extractPriceFromItem,
  PRICE_RANGES 
} = require('./utils/priceRangeUtils');

console.log('🧪 測試價格範圍邏輯\n');

// 測試 1: 檢查價格範圍定義
console.log('📋 價格範圍定義:');
Object.entries(PRICE_RANGES).forEach(([code, range]) => {
  console.log(`  ${code}: ${range.label} (${range.min || '無限制'} - ${range.max || '無限制'})`);
});

console.log('\n🔍 測試價格範圍代碼判斷:');
const testPrices = [0, 50, 100, 150, 300, 400, 500, 750, 1000, 1200, 2000];
testPrices.forEach(price => {
  const rangeCode = getPriceRangeCode(price);
  const range = getPriceRange(rangeCode);
  console.log(`  價格 ${price}: ${rangeCode} (${range.label})`);
});

console.log('\n💰 測試價格字符串提取:');
const testPriceStrings = [
  'HK$ 92',
  '每堂 HK$ 101',
  'HK$ 350',
  '450',
  'HK$ 1,000',
  '1200',
  '待議',
  '面議',
  ''
];
testPriceStrings.forEach(str => {
  const extracted = extractPriceFromString(str);
  console.log(`  "${str}" → ${extracted}`);
});

console.log('\n🔧 測試MongoDB查詢條件:');
Object.keys(PRICE_RANGES).forEach(rangeCode => {
  const query = buildPriceQuery(rangeCode);
  console.log(`  ${rangeCode}: ${JSON.stringify(query)}`);
});

console.log('\n✅ 測試價格範圍匹配:');
const testCases = [
  { price: 92, range: '0-100', expected: true },
  { price: 92, range: '101-300', expected: false },
  { price: 350, range: '301-500', expected: true },
  { price: 450, range: '301-500', expected: true },
  { price: 1000, range: '501-1000', expected: true },
  { price: 1200, range: '1001+', expected: true },
  { price: 1200, range: '501-1000', expected: false },
  { price: 0, range: 'unlimited', expected: true },
  { price: 9999, range: 'unlimited', expected: true }
];

testCases.forEach(({ price, range, expected }) => {
  const result = isPriceInRange(price, range);
  const status = result === expected ? '✅' : '❌';
  console.log(`  ${status} 價格 ${price} 在範圍 ${range}: ${result} (期望: ${expected})`);
});

console.log('\n🎯 實際案例測試:');
const realCases = [
  { title: '學生案例1', budget: 'HK$ 350', description: '每堂 HK$ 350' },
  { title: '學生案例2', budget: 'HK$ 450', description: '每堂 HK$ 450' },
  { title: '導師案例1', lessonDetails: { pricePerLesson: 300 }, description: '導師收費每堂 HK$ 300' },
  { title: '導師案例2', lessonDetails: { pricePerLesson: 500 }, description: '導師收費每堂 HK$ 500' }
];

realCases.forEach(case_ => {
  const extracted = extractPriceFromItem(case_);
  const rangeCode = getPriceRangeCode(extracted);
  const range = getPriceRange(rangeCode);
  console.log(`  ${case_.title}: ${extracted} → ${rangeCode} (${range.label})`);
});

console.log('\n✨ 價格範圍邏輯測試完成！'); 