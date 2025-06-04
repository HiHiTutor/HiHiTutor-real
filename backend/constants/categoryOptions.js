// 統一的科目分類和代碼
const CATEGORY_OPTIONS = {
  'early-childhood': {
    label: '幼兒教育',
    subjects: [
      { value: 'early-childhood-chinese', label: '幼兒中文' },
      { value: 'early-childhood-english', label: '幼兒英文' },
      { value: 'early-childhood-math', label: '幼兒數學' },
      { value: 'early-childhood-phonics', label: '拼音／注音' },
      { value: 'early-childhood-logic', label: '邏輯思維訓練' },
      { value: 'early-childhood-interview', label: '面試技巧訓練' },
      { value: 'early-childhood-homework', label: '幼稚園功課輔導' }
    ]
  },
  'primary-secondary': {
    label: '中小學教育',
    subjects: [
      { value: 'primary-chinese', label: '小學中文' },
      { value: 'primary-english', label: '小學英文' },
      { value: 'primary-math', label: '小學數學' },
      { value: 'primary-general', label: '常識' },
      { value: 'primary-mandarin', label: '普通話' },
      { value: 'primary-stem', label: '常識／STEM' },
      { value: 'primary-all', label: '其他全科補習' },
      { value: 'secondary-chinese', label: '中學中文' },
      { value: 'secondary-english', label: '中學英文' },
      { value: 'secondary-math', label: '中學數學' },
      { value: 'secondary-ls', label: '通識教育' },
      { value: 'secondary-physics', label: '物理' },
      { value: 'secondary-chemistry', label: '化學' },
      { value: 'secondary-biology', label: '生物' },
      { value: 'secondary-economics', label: '經濟' },
      { value: 'secondary-geography', label: '地理' },
      { value: 'secondary-history', label: '歷史' },
      { value: 'secondary-chinese-history', label: '中國歷史' },
      { value: 'secondary-bafs', label: '企會財' },
      { value: 'secondary-ict', label: '資訊與通訊科技' },
      { value: 'secondary-integrated-science', label: '綜合科學' },
      { value: 'secondary-dse', label: 'DSE總溫習' },
      { value: 'secondary-all', label: '全科補習' }
    ]
  },
  'interest': {
    label: '興趣班',
    subjects: [
      { value: 'interest-art', label: '繪畫' },
      { value: 'interest-music', label: '音樂（鋼琴、結他、小提琴等）' },
      { value: 'interest-dance', label: '跳舞／舞蹈訓練' },
      { value: 'interest-drama', label: '戲劇／演講' },
      { value: 'interest-programming', label: '編程／STEM' },
      { value: 'interest-foreign-language', label: '外語（韓文／日文／法文／德文等）' },
      { value: 'interest-magic-chess', label: '魔術／棋藝' },
      { value: 'interest-photography', label: '攝影／影片剪接' }
    ]
  },
  'tertiary': {
    label: '大專補習課程',
    subjects: [
      { value: 'tertiary-liberal', label: '大學通識' },
      { value: 'tertiary-math', label: '大學統計與數學' },
      { value: 'tertiary-economics', label: '經濟學' },
      { value: 'tertiary-it', label: '資訊科技' },
      { value: 'tertiary-business', label: '商科（會計、管理、市場學等）' },
      { value: 'tertiary-engineering', label: '工程科目' },
      { value: 'tertiary-thesis', label: '論文指導／報告協助' }
    ]
  },
  'adult': {
    label: '成人教育',
    subjects: [
      { value: 'adult-business-english', label: '商務英文' },
      { value: 'adult-conversation', label: '生活英語會話' },
      { value: 'adult-chinese', label: '廣東話／普通話' },
      { value: 'adult-second-language', label: '興趣／第二語言學習' },
      { value: 'adult-computer', label: '電腦技能（Excel／Photoshop 等）' },
      { value: 'adult-exam-prep', label: '考試準備（IELTS／TOEFL／JLPT）' }
    ]
  }
};

module.exports = CATEGORY_OPTIONS; 