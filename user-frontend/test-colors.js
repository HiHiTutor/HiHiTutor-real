// 測試顏色邏輯
function getColorScheme(pathname, fetchUrl) {
  const isStudentCase = fetchUrl.includes('student');
  
  if (pathname === '/') {
    // 首頁：銀灰色，與 Topbar 一致
    return {
      text: 'text-gray-700',
      border: 'border-gray-300',
      bg: 'bg-gradient-to-b from-white to-gray-100',
      button: 'bg-gray-500 hover:bg-gray-600'
    };
  } else if (pathname === '/tutors') {
    // 導師列表頁：黃色主題
    return {
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    };
  } else if (pathname === '/find-tutor-cases') {
    // 個案頁：保持藍色主題
    return {
      text: 'text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      button: 'bg-blue-500 hover:bg-blue-600'
    };
  } else {
    // 其他頁面：根據 fetchUrl 判斷
    return isStudentCase ? {
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    } : {
      text: 'text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      button: 'bg-blue-500 hover:bg-blue-600'
    };
  }
}

// 測試案例
console.log('=== 測試搜尋欄顏色邏輯 ===');

const testCases = [
  { pathname: '/', fetchUrl: '/find-tutor-cases', expected: '銀灰色' },
  { pathname: '/tutors', fetchUrl: '/tutors', expected: '黃色' },
  { pathname: '/find-tutor-cases', fetchUrl: '/find-tutor-cases', expected: '藍色' },
  { pathname: '/other-page', fetchUrl: '/find-student-cases', expected: '黃色' },
  { pathname: '/other-page', fetchUrl: '/tutors', expected: '藍色' }
];

testCases.forEach((test, index) => {
  const colors = getColorScheme(test.pathname, test.fetchUrl);
  const bgClass = colors.bg;
  
  console.log(`測試 ${index + 1}: ${test.pathname}`);
  console.log(`  預期: ${test.expected}`);
  console.log(`  實際背景: ${bgClass}`);
  
  // 簡單驗證
  let actualColor = '未知';
  if (bgClass.includes('gray')) actualColor = '銀灰色';
  else if (bgClass.includes('yellow')) actualColor = '黃色';
  else if (bgClass.includes('blue')) actualColor = '藍色';
  
  const pass = actualColor === test.expected;
  console.log(`  結果: ${pass ? '✓ 通過' : '✗ 失敗'}`);
  console.log('');
});

console.log('=== 顏色方案詳情 ===');
testCases.forEach((test, index) => {
  const colors = getColorScheme(test.pathname, test.fetchUrl);
  console.log(`頁面: ${test.pathname}`);
  console.log(`  背景: ${colors.bg}`);
  console.log(`  邊框: ${colors.border}`);
  console.log(`  文字: ${colors.text}`);
  console.log(`  按鈕: ${colors.button}`);
  console.log('');
}); 