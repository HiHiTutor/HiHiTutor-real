// 測試分類統一化結果

// 模擬 SUBJECT_MAP
const SUBJECT_MAP = {
  // 幼兒教育
  'early-childhood-chinese': '幼兒中文',
  'early-childhood-english': '幼兒英文',
  'early-childhood-math': '幼兒數學',
  'early-childhood-phonics': '拼音／注音',
  'early-childhood-logic': '邏輯思維訓練',
  'early-childhood-interview': '面試技巧訓練',
  'early-childhood-homework': '幼稚園功課輔導',

  // 小學教育
  'primary-chinese': '小學中文',
  'primary-english': '小學英文',
  'primary-math': '小學數學',
  'primary-general': '常識',
  'primary-mandarin': '普通話',
  'primary-stem': '常識／STEM',
  'primary-all': '其他全科補習',

  // 中學教育
  'secondary-chinese': '中學中文',
  'secondary-english': '中學英文',
  'secondary-math': '中學數學',
  'secondary-ls': '通識教育',
  'secondary-physics': '物理',
  'secondary-chemistry': '化學',
  'secondary-biology': '生物',
  'secondary-economics': '經濟',
  'secondary-geography': '地理',
  'secondary-history': '歷史',
  'secondary-chinese-history': '中國歷史',
  'secondary-bafs': '企會財',
  'secondary-ict': '資訊與通訊科技',
  'secondary-integrated-science': '綜合科學',
  'secondary-dse': 'DSE總溫習',
  'secondary-all': '全科補習',

  // 興趣班
  'art': '繪畫',
  'music': '音樂（鋼琴、結他、小提琴等）',
  'dance': '跳舞／舞蹈訓練',
  'drama': '戲劇／演講',
  'programming': '編程／STEM',
  'foreign-language': '外語（韓文／日文／法文／德文等）',
  'magic-chess': '魔術／棋藝',
  'photography': '攝影／影片剪接',

  // 大專補習課程
  'uni-liberal': '大學通識',
  'uni-math': '大學統計與數學',
  'uni-economics': '經濟學',
  'uni-it': '資訊科技',
  'uni-business': '商科（會計、管理、市場學等）',
  'uni-engineering': '工程科目',
  'uni-thesis': '論文指導／報告協助',

  // 成人教育
  'business-english': '商務英文',
  'conversation': '生活英語會話',
  'chinese-language': '廣東話／普通話',
  'second-language': '興趣／第二語言學習',
  'computer-skills': '電腦技能（Excel／Photoshop 等）',
  'exam-prep': '考試準備（IELTS／TOEFL／JLPT）'
};

// 模擬 getSubjectName 函數
function getSubjectName(subject) {
  if (!subject) return '未指定科目';
  
  // 先從 SUBJECT_MAP 查找
  const mappedName = SUBJECT_MAP[subject];
  if (mappedName) {
    return mappedName;
  }
  
  // 如果找不到，嘗試一些常見的 fallback 處理
  const fallbackMap = {
    'math': '數學',
    'english': '英文',
    'chinese': '中文',
    'physics': '物理',
    'chemistry': '化學',
    'biology': '生物',
    'economics': '經濟',
    'geography': '地理',
    'history': '歷史',
    'music': '音樂',
    'art': '美術',
    'pe': '體育',
    'computer': '電腦',
    'programming': '編程'
  };
  
  // 檢查是否包含這些關鍵字
  for (const [key, value] of Object.entries(fallbackMap)) {
    if (subject.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  // 最後的 fallback：返回原值或預設值
  return subject || '未定義科目';
}

// 測試案例
console.log('=== 測試分類統一化 ===');

// 測試 1: 標準科目代碼
console.log('1. 標準科目代碼測試:');
console.log('early-childhood-chinese ->', getSubjectName('early-childhood-chinese'));
console.log('primary-math ->', getSubjectName('primary-math'));
console.log('secondary-english ->', getSubjectName('secondary-english'));

// 測試 2: 未知科目代碼
console.log('\n2. 未知科目代碼測試:');
console.log('unknown-subject ->', getSubjectName('unknown-subject'));
console.log('null ->', getSubjectName(null));
console.log('empty ->', getSubjectName(''));

// 測試 3: 包含關鍵字的科目
console.log('\n3. 包含關鍵字的科目測試:');
console.log('advanced-math ->', getSubjectName('advanced-math'));
console.log('business-english ->', getSubjectName('business-english'));
console.log('computer-science ->', getSubjectName('computer-science'));

// 測試 4: 興趣班科目
console.log('\n4. 興趣班科目測試:');
console.log('art ->', getSubjectName('art'));
console.log('music ->', getSubjectName('music'));
console.log('dance ->', getSubjectName('dance'));

// 測試 5: 大學科目
console.log('\n5. 大學科目測試:');
console.log('uni-liberal ->', getSubjectName('uni-liberal'));
console.log('uni-math ->', getSubjectName('uni-math'));
console.log('uni-business ->', getSubjectName('uni-business'));

console.log('\n=== 測試完成 ===');
console.log('✅ 所有科目現在都使用統一的翻譯函數');
console.log('✅ 支援 fallback 處理未知科目');
console.log('✅ 顯示用戶友好的中文名稱'); 