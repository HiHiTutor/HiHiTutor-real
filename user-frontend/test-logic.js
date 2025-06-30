// 測試邏輯
function shouldShowTarget(pathname) {
  // 首頁顯示目標選擇
  if (pathname === '/') {
    return true;
  }
  // 其他頁面隱藏目標選擇
  return false;
}

function getAutoTarget(pathname) {
  // 根據頁面路徑自動設定目標
  if (pathname === '/tutors') {
    return 'find-tutor';
  } else if (pathname === '/find-tutor-cases') {
    return 'find-student';
  }
  // 首頁或其他頁面返回空值，讓用戶選擇
  return '';
}

// 測試案例
console.log('=== 測試 shouldShowTarget ===');
console.log('首頁 /:', shouldShowTarget('/')); // 應該返回 true
console.log('導師頁面 /tutors:', shouldShowTarget('/tutors')); // 應該返回 false
console.log('個案頁面 /find-tutor-cases:', shouldShowTarget('/find-tutor-cases')); // 應該返回 false

console.log('\n=== 測試 getAutoTarget ===');
console.log('首頁 /:', getAutoTarget('/')); // 應該返回 ''
console.log('導師頁面 /tutors:', getAutoTarget('/tutors')); // 應該返回 'find-tutor'
console.log('個案頁面 /find-tutor-cases:', getAutoTarget('/find-tutor-cases')); // 應該返回 'find-student'

console.log('\n=== 測試完整邏輯 ===');
const testCases = [
  { pathname: '/', expectedShow: true, expectedTarget: '' },
  { pathname: '/tutors', expectedShow: false, expectedTarget: 'find-tutor' },
  { pathname: '/find-tutor-cases', expectedShow: false, expectedTarget: 'find-student' }
];

testCases.forEach(test => {
  const show = shouldShowTarget(test.pathname);
  const target = getAutoTarget(test.pathname);
  const showPass = show === test.expectedShow;
  const targetPass = target === test.expectedTarget;
  
  console.log(`頁面: ${test.pathname}`);
  console.log(`  顯示目標選擇: ${show} (${showPass ? '✓' : '✗'})`);
  console.log(`  自動目標: ${target} (${targetPass ? '✓' : '✗'})`);
  console.log(`  整體: ${showPass && targetPass ? '✓ 通過' : '✗ 失敗'}`);
  console.log('');
}); 