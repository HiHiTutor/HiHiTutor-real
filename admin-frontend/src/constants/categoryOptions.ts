export interface CategoryOption {
  value: string;
  label: string;
  subjects?: { value: string; label: string }[];
  subCategories?: {
    value: string;
    label: string;
    subjects: { value: string; label: string }[];
  }[];
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { 
    value: 'early-childhood',
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
  { 
    value: 'primary', 
    label: '小學教育',
    subjects: [
      { value: 'primary-chinese', label: '中文' },
      { value: 'primary-english', label: '英文' },
      { value: 'primary-math', label: '數學' },
      { value: 'primary-general', label: '常識' },
      { value: 'primary-mandarin', label: '普通話' },
      { value: 'primary-stem', label: 'STEM' },
      { value: 'primary-all', label: '全科補習' }
    ]
  },
  { 
    value: 'secondary', 
    label: '中學教育',
    subjects: [
      { value: 'secondary-chinese', label: '中文' },
      { value: 'secondary-english', label: '英文' },
      { value: 'secondary-math', label: '數學' },
      { value: 'secondary-ls', label: '通識教育' },
      { value: 'secondary-physics', label: '物理' },
      { value: 'secondary-chemistry', label: '化學' },
      { value: 'secondary-biology', label: '生物' },
      { value: 'secondary-economics', label: '經濟' },
      { value: 'secondary-geography', label: '地理' },
      { value: 'secondary-history', label: '歷史' },
      { value: 'secondary-chinese-history', label: '中國歷史' },
      { value: 'secondary-bafs', label: 'BAFS' },
      { value: 'secondary-ict', label: 'ICT' },
      { value: 'secondary-integrated-science', label: '綜合科學' },
      { value: 'secondary-dse', label: '其他 DSE 專科補習' },
      { value: 'secondary-all', label: '全科補習' }
    ]
  }
];

// 為了向後兼容，也提供舊的對象格式
export const CATEGORY_OPTIONS_OBJECT = CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category;
  return acc;
}, {} as Record<string, CategoryOption>);

export default CATEGORY_OPTIONS;
