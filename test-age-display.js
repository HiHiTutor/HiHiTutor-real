// 測試年齡顯示功能
const { calculateAge, formatAge } = require('./user-frontend/src/utils/ageUtils.ts');

// 測試數據
const testCases = [
  { birthDate: '1990-01-01', expected: '34歲' },
  { birthDate: '1995-06-15', expected: '29歲' },
  { birthDate: '2000-12-31', expected: '23歲' },
  { birthDate: null, expected: '未知' },
  { birthDate: undefined, expected: '未知' },
  { birthDate: 'invalid-date', expected: '未知' }
];

console.log('🧪 測試年齡計算功能...\n');

testCases.forEach((testCase, index) => {
  const age = calculateAge(testCase.birthDate);
  const formatted = formatAge(age);
  const passed = formatted === testCase.expected;
  
  console.log(`測試 ${index + 1}: ${passed ? '✅' : '❌'}`);
  console.log(`  輸入: ${testCase.birthDate}`);
  console.log(`  期望: ${testCase.expected}`);
  console.log(`  實際: ${formatted}`);
  console.log('');
});

console.log('🎉 年齡計算功能測試完成！');
