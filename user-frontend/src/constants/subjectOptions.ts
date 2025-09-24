import CATEGORY_OPTIONS from './categoryOptions';

// 生成科目映射
export const SUBJECT_MAP: { [key: string]: string } = {
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
  'primary-stem': 'STEM',
  'primary-all': '全科補習',

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
  'secondary-dse': '其他 DSE 專科補習',
  'secondary-all': '全科補習',

  // 興趣班 - 修正代碼以匹配後端
  'art': '繪畫',
  'music': '音樂（鋼琴、結他、小提琴等）',
  'dance': '跳舞／舞蹈訓練',
  'drama': '戲劇／演講',
  'programming': '編程／STEM',
  'foreign-language': '外語（韓文／日文／法文／德文等）',
  'magic-chess': '魔術／棋藝',
  'photography': '攝影／影片剪接',
  'piano': '鋼琴',
  'drawing': '繪畫',
  'mandarin': '普通話',

  // 大專補習課程 - 修正代碼以匹配後端
  'uni-liberal': '大學通識',
  'uni-math': '大學統計與數學',
  'uni-economics': '經濟學',
  'uni-it': '資訊科技',
  'uni-business': '商科（會計、管理、市場學等）',
  'uni-engineering': '工程科目',
  'uni-thesis': '論文指導／報告協助',

  // 成人教育 - 修正代碼以匹配後端
  'business-english': '商務英文',
  'conversation': '生活英語會話',
  'chinese-language': '廣東話／普通話',
  'second-language': '興趣／第二語言學習',
  'computer-skills': '電腦技能（Excel／Photoshop 等）',
  'exam-prep': '考試準備（IELTS／TOEFL／JLPT）',
  'ib-physics': 'IB物理',
  'ib-chemistry': 'IB化學',
  'ib-math': 'IB數學',
  'ib-biology': 'IB生物',
  'ib-english': 'IB英文',
  'ib-chinese': 'IB中文',
  'adult-english': '成人英文',
  'adult-japanese': '成人日語',
  'adult-mandarin': '成人普通話',
  'adult-cantonese': '成人廣東話',
};

// 輔助函數：獲取科目中文名稱
export function getSubjectName(subject: string): string {
  return SUBJECT_MAP[subject] || subject;
}

// 輔助函數：獲取多個科目的中文名稱
export function getSubjectNames(subjects: string[]): string {
  if (!subjects || subjects.length === 0) return '未指定';
  return subjects.map(getSubjectName).join('、');
}

export default SUBJECT_MAP; 