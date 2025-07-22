// 教學模式映射
export const TEACHING_MODE_MAP: { [key: string]: string } = {
  'online': '網課',
  'in-person': '面授',
  'both': '皆可',
  'one-on-one': '一對一',
  'small-group': '小班教學',
  'large-center': '大型補習社'
};

// 地區映射
export const REGION_MAP: { [key: string]: string } = {
  'central': '中環',
  'causeway-bay': '銅鑼灣',
  'mong-kok': '旺角',
  'sha-tin': '沙田',
  'tai-po': '大埔',
  'fanling': '粉嶺',
  'sheung-shui': '上水',
  'ma-on-shan': '馬鞍山',
  'wu-kai-sha': '烏溪沙',
  'university': '大學',
  'fo-tan': '火炭',
  'racecourse': '馬場',
  'hung-hom': '紅磡',
  'whampoa': '黃埔',
  'to-kwa-wan': '土瓜灣',
  'ho-man-tin': '何文田',
  'kowloon-tong': '九龍塘',
  'lok-fu': '樂富',
  'diamond-hill': '鑽石山',
  'wong-tai-sin': '黃大仙',
  'kowloon-bay': '九龍灣',
  'ngau-tau-kok': '牛頭角',
  'kwun-tong': '觀塘',
  'lam-tin': '藍田',
  'yau-tong': '油塘',
  'tiu-keng-leng': '調景嶺',
  'hang-hau': '坑口',
  'po-lam': '寶琳',
  'lohas-park': '康城',
  'tuen-mun': '屯門',
  'siu-hong': '兆康',
  'yuen-long': '元朗',
  'long-ping': '朗屏',
  'tin-shui-wai': '天水圍',
  'tsuen-wan': '荃灣',
  'kwai-fong': '葵芳',
  'kwai-chung': '葵涌',
  'tsing-yi': '青衣',
  'kam-sheung-road': '錦上路',
  'sai-kung': '西貢',
  'tung-chung': '東涌',
  'mui-wo': '梅窩',
  'tai-o': '大澳',
  'ping-chau': '坪洲',
  'cheung-chau': '長洲',
  'lamma-island': '南丫島',
  'discovery-bay': '愉景灣',
  'pui-o': '貝澳'
};

// 課程分類映射
export const CATEGORY_MAP: { [key: string]: string } = {
  'early-childhood': '幼兒教育',
  'primary-secondary': '中小學',
  'interest': '興趣班',
  'tertiary': '大專院校',
  'adult': '成人教育'
};

// 子分類映射
export const SUB_CATEGORY_MAP: { [key: string]: string } = {
  'primary': '小學',
  'secondary': '中學',
  'dse': 'DSE',
  'ib': 'IB',
  'igcse': 'IGCSE',
  'sat': 'SAT',
  'ielts': 'IELTS',
  'toefl': 'TOEFL'
};

// 獲取教學模式顯示文字
export const getTeachingModeDisplay = (mode: string): string => {
  return TEACHING_MODE_MAP[mode] || mode;
};

// 獲取地區顯示文字
export const getRegionDisplay = (region: string): string => {
  return REGION_MAP[region] || region;
};

// 獲取課程分類顯示文字
export const getCategoryDisplay = (category: string): string => {
  return CATEGORY_MAP[category] || category;
};

// 獲取子分類顯示文字
export const getSubCategoryDisplay = (subCategory: string): string => {
  return SUB_CATEGORY_MAP[subCategory] || subCategory;
};

// 格式化教學子模式顯示
export const formatTeachingSubModes = (subModes: string[]): string => {
  if (!subModes || subModes.length === 0) return '';
  return subModes.map(mode => getTeachingModeDisplay(mode)).join('、');
};

// 格式化地區顯示
export const formatRegions = (regions: string[]): string => {
  if (!regions || regions.length === 0) return '';
  return regions.map(region => getRegionDisplay(region)).join('、');
};

// 格式化科目顯示
export const formatSubjects = (subjects: string[]): string => {
  if (!subjects || subjects.length === 0) return '';
  return subjects.join('、');
};

// 格式化科目顯示（使用翻譯）
export const formatSubjectsWithTranslation = (subjects: string[]): string => {
  if (!subjects || subjects.length === 0) return '';
  // 需要導入 getSubjectName 函數，這裡先使用原始值
  return subjects.join('、');
}; 