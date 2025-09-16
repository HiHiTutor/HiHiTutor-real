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
  // 基本地區名稱
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
  'pui-o': '貝澳',
  
  // 完整路徑格式的地區名稱（用於導師詳情頁面）
  'hong-kong-island-central': '中環',
  'hong-kong-island-sheung-wan': '上環',
  'hong-kong-island-sai-wan': '西環',
  'hong-kong-island-sai-ying-pun': '西營盤',
  'hong-kong-island-shek-tong-tsui': '石塘咀',
  'hong-kong-island-wan-chai': '灣仔',
  'hong-kong-island-causeway-bay': '銅鑼灣',
  'hong-kong-island-admiralty': '金鐘',
  'hong-kong-island-happy-valley': '跑馬地',
  'hong-kong-island-tin-hau': '天后',
  'hong-kong-island-tai-hang': '大坑',
  'hong-kong-island-north-point': '北角',
  'hong-kong-island-quarry-bay': '鰂魚涌',
  'hong-kong-island-taikoo': '太古',
  'hong-kong-island-sai-wan-ho': '西灣河',
  'hong-kong-island-shau-kei-wan': '筲箕灣',
  'hong-kong-island-chai-wan': '柴灣',
  'hong-kong-island-heng-fa-chuen': '杏花邨',
  
  'kowloon-tsim-sha-tsui': '尖沙咀',
  'kowloon-jordan': '佐敦',
  'kowloon-yau-ma-tei': '油麻地',
  'kowloon-mong-kok': '旺角',
  'kowloon-prince-edward': '太子',
  'kowloon-sham-shui-po': '深水埗',
  'kowloon-cheung-sha-wan': '長沙灣',
  'kowloon-hung-hom': '紅磡',
  'kowloon-to-kwa-wan': '土瓜灣',
  'kowloon-ho-man-tin': '何文田',
  'kowloon-kowloon-tong': '九龍塘',
  'kowloon-san-po-kong': '新蒲崗',
  'kowloon-diamond-hill': '鑽石山',
  'kowloon-lok-fu': '樂富',
  'kowloon-tsz-wan-shan': '慈雲山',
  'kowloon-ngau-tau-kok': '牛頭角',
  'kowloon-lam-tin': '藍田',
  'kowloon-kwun-tong': '觀塘',
  'kowloon-yau-tong': '油塘',
  'kowloon-wong-tai-sin': '黃大仙',
  
  'new-territories-sha-tin': '沙田',
  'new-territories-ma-on-shan': '馬鞍山',
  'new-territories-tai-wai': '大圍',
  'new-territories-fo-tan': '火炭',
  'new-territories-tai-po': '大埔',
  'new-territories-tai-wo': '太和',
  'new-territories-fan-ling': '粉嶺',
  'new-territories-sheung-shui': '上水',
  'new-territories-tseung-kwan-o': '將軍澳',
  'new-territories-hang-hau': '坑口',
  'new-territories-po-lam': '寶琳',
  'new-territories-lohas-park': '康城',
  'new-territories-tuen-mun': '屯門',
  'new-territories-siu-hong': '兆康',
  'new-territories-yuen-long': '元朗',
  'new-territories-long-ping': '朗屏',
  'new-territories-tin-shui-wai': '天水圍',
  'new-territories-tsuen-wan': '荃灣',
  'new-territories-kwai-fong': '葵芳',
  'new-territories-kwai-chung': '葵涌',
  'new-territories-tsing-yi': '青衣',
  
  'islands-tung-chung': '東涌',
  'islands-mui-wo': '梅窩',
  'islands-tai-o': '大澳',
  'islands-ping-chau': '坪洲',
  'islands-cheung-chau': '長洲',
  'islands-lamma-island': '南丫島',
  'islands-discovery-bay': '愉景灣',
  'islands-pui-o': '貝澳'
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