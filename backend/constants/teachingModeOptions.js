// 教學模式選項
const TEACHING_MODE_OPTIONS = [
  { value: 'online', label: '網上' },
  { value: 'in-person', label: '面授' },
  { value: 'both', label: '混合' }
];

// 教學模式映射（用於轉換不同格式）
const TEACHING_MODE_MAP = {
  // 英文到中文
  'online': '網上',
  'in-person': '面授',
  'both': '混合',
  
  // 中文到英文
  '網上': 'online',
  '面授': 'in-person',
  '混合': 'both',
  
  // 其他可能的格式
  '網課': 'online',
  '線上': 'online',
  '面對面': 'in-person',
  '線下': 'in-person',
  '兩者皆可': 'both',
  '都可以': 'both'
};

// 獲取教學模式標籤
const getTeachingModeLabel = (modeCode) => {
  return TEACHING_MODE_MAP[modeCode] || modeCode;
};

// 獲取教學模式代碼
const getTeachingModeCode = (modeLabel) => {
  return TEACHING_MODE_MAP[modeLabel] || modeLabel;
};

// 驗證教學模式是否有效
const isValidTeachingMode = (mode) => {
  return TEACHING_MODE_OPTIONS.some(option => option.value === mode);
};

module.exports = {
  TEACHING_MODE_OPTIONS,
  TEACHING_MODE_MAP,
  getTeachingModeLabel,
  getTeachingModeCode,
  isValidTeachingMode
}; 