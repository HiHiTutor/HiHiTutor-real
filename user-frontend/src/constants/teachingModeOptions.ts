// 教學模式選項
export const TEACHING_MODE_OPTIONS = [
  { 
    value: 'in-person', 
    label: '面授',
    subCategories: [
      { value: 'one-on-one', label: '一對一' },
      { value: 'small-group', label: '小班教學' },
      { value: 'large-center', label: '大型補習社' }
    ]
  },
  { 
    value: 'online', 
    label: '網課',
    subCategories: [] // 網課沒有子分類
  }
];

// 教學模式映射（用於轉換不同格式）
export const TEACHING_MODE_MAP: { [key: string]: string } = {
  // 英文到中文
  'online': '網課',
  'in-person': '面授',
  'one-on-one': '一對一',
  'small-group': '小班教學',
  'large-center': '大型補習社',
  
  // 中文到英文
  '網課': 'online',
  '網上': 'online',
  '面授': 'in-person',
  '面對面': 'in-person',
  '一對一': 'one-on-one',
  '小班教學': 'small-group',
  '大型補習社': 'large-center',
  
  // 其他可能的格式
  '線上': 'online',
  '線下': 'in-person',
  '兩者皆可': 'both',
  '都可以': 'both'
};

// 獲取教學模式標籤
export const getTeachingModeLabel = (modeCode: string): string => {
  return TEACHING_MODE_MAP[modeCode] || modeCode;
};

// 獲取教學模式代碼
export const getTeachingModeCode = (modeLabel: string): string => {
  return TEACHING_MODE_MAP[modeLabel] || modeLabel;
};

// 驗證教學模式是否有效
export const isValidTeachingMode = (mode: string): boolean => {
  return TEACHING_MODE_OPTIONS.some(option => 
    option.value === mode || 
    option.subCategories.some(sub => sub.value === mode)
  );
};

// 獲取教學模式的大分類
export const getTeachingModeCategory = (modeCode: string): string | null => {
  for (const option of TEACHING_MODE_OPTIONS) {
    if (option.value === modeCode) {
      return option.value;
    }
    if (option.subCategories.some(sub => sub.value === modeCode)) {
      return option.value;
    }
  }
  return null;
};

// 檢查是否需要顯示地區選項
export const shouldShowRegionForMode = (modeCode: string): boolean => {
  return modeCode === 'in-person' || 
         ['one-on-one', 'small-group', 'large-center'].includes(modeCode);
}; 