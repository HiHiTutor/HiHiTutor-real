// 分類映射函數
export const getCategoryLabel = (categoryValue: string): string => {
  const categoryMap: { [key: string]: string } = {
    'early-childhood': '幼兒教育',
    'primary-secondary': '中小學教育',
    'primary': '小學教育',
    'secondary': '中學教育',
    'interest': '興趣班',
    'tertiary': '大專補習課程',
    'adult': '成人教育',
    'unlimited': '不限'
  };
  
  return categoryMap[categoryValue] || categoryValue;
};

// 子分類映射函數
export const getSubCategoryLabel = (subCategoryValue: string): string => {
  const subCategoryMap: { [key: string]: string } = {
    'one-on-one': '一對一',
    'small-group': '小班教學',
    'large-center': '補習社',
    'unlimited': '不限'
  };
  
  return subCategoryMap[subCategoryValue] || subCategoryValue;
};

// 狀態映射函數
export const getStatusLabel = (statusValue: string): string => {
  const statusMap: { [key: string]: string } = {
    'open': '開放中',
    'matched': '已配對',
    'closed': '已關閉',
    'pending': '待處理'
  };
  
  return statusMap[statusValue] || statusValue;
};

// 類型映射函數
export const getTypeLabel = (typeValue: string): string => {
  const typeMap: { [key: string]: string } = {
    'student': '學生案例',
    'tutor': '導師案例'
  };
  
  return typeMap[typeValue] || typeValue;
};

// 模式映射函數
export const getModeLabel = (modeValue: string): string => {
  const modeMap: { [key: string]: string } = {
    'online': '網上教學',
    'offline': '面授教學',
    'hybrid': '混合教學',
    'in-person': '面授教學',
    'unlimited': '不限'
  };
  
  return modeMap[modeValue] || modeValue;
};

// 經驗映射函數
export const getExperienceLabel = (experienceValue: string): string => {
  const experienceMap: { [key: string]: string } = {
    'beginner': '初學者',
    'intermediate': '中級',
    'advanced': '高級',
    'expert': '專家級',
    'unlimited': '不限'
  };
  
  return experienceMap[experienceValue] || experienceValue;
};

// 科目映射函數
export const getSubjectLabel = (subjectValue: string): string => {
  const subjectMap: { [key: string]: string } = {
    // 通用科目
    'mathematics': '數學',
    'english': '英文',
    'chinese': '中文',
    'physics': '物理',
    'chemistry': '化學',
    'biology': '生物',
    'history': '歷史',
    'geography': '地理',
    'economics': '經濟',
    'accounting': '會計',
    'computer-science': '電腦科學',
    'programming': '程式設計',
    'music': '音樂',
    'art': '美術',
    'sports': '體育',
    'cooking': '烹飪',
    'dance': '舞蹈',
    'photography': '攝影',
    'languages': '語言學習',
    'test-preparation': '考試準備',
    
    // 小學科目
    'primary-math': '小學數學',
    'primary-english': '小學英文',
    'primary-chinese': '小學中文',
    
    // 中學科目
    'secondary-math': '中學數學',
    'secondary-english': '中學英文',
    'secondary-chinese': '中學中文',
    'secondary-physics': '中學物理',
    'secondary-chemistry': '中學化學',
    'secondary-biology': '中學生物',
    'secondary-history': '中學歷史',
    'secondary-geography': '中學地理',
    'secondary-economics': '中學經濟',
    
    // 幼兒教育
    'preschool-math': '幼兒數學',
    'preschool-english': '幼兒英文',
    'preschool-chinese': '幼兒中文',
    
    // IB科目
    'ib-physics': 'IB物理',
    'ib-chemistry': 'IB化學',
    'ib-biology': 'IB生物',
    'ib-math': 'IB數學',
    'ib-english': 'IB英文',
    
    // 大學科目
    'business': '商科',
    'engineering': '工程',
    'science': '理科',
    'arts': '文科',
    'masters': '碩士',
    'phd': '博士',
    'research': '研究',
    
    // 興趣科目
    'piano': '鋼琴',
    
    // 成人教育
    'business-english': '商業英文',
    'conversation': '會話',
    'ielts': '雅思',
    
    'unlimited': '不限'
  };
  
  return subjectMap[subjectValue] || subjectValue;
};

// 地區映射函數
export const getRegionLabel = (regionValue: string): string => {
  const regionMap: { [key: string]: string } = {
    // 主要地區
    'all-hong-kong': '全港',
    'hong-kong-island': '香港島',
    'kowloon': '九龍',
    'new-territories': '新界',
    'islands': '離島',
    
    // 香港島區域
    'central-western': '中西區',
    'eastern': '東區',
    'southern': '南區',
    'wan-chai': '灣仔區',
    
    // 九龍區域
    'sham-shui-po': '深水埗區',
    'kowloon-city': '九龍城區',
    'kwun-tong': '觀塘區',
    'wong-tai-sin': '黃大仙區',
    'yau-tsim-mong': '油尖旺區',
    
    // 新界區域
    'islands-district': '離島區',
    'kwai-tsing': '葵青區',
    'north': '北區',
    'sai-kung': '西貢區',
    'sha-tin': '沙田區',
    'tai-po': '大埔區',
    'tsuen-wan': '荃灣區',
    'tuen-mun': '屯門區',
    'yuen-long': '元朗區',
    
    'unlimited': '不限'
  };
  
  return regionMap[regionValue] || regionValue;
};

// 子地區映射函數
export const getSubRegionLabel = (subRegionValue: string): string => {
  const subRegionMap: { [key: string]: string } = {
    // 香港島子地區
    'central': '中環',
    'admiralty': '金鐘',
    'sheung-wan': '上環',
    'sai-wan': '西環',
    'sai-ying-pun': '西營盤',
    'shek-tong-tsui': '石塘咀',
    'causeway-bay': '銅鑼灣',
    'wan-chai': '灣仔',
    'happy-valley': '跑馬地',
    'tin-hau': '天后',
    'tai-hang': '大坑',
    'north-point': '北角',
    'quarry-bay': '鰂魚涌',
    'taikoo': '太古',
    'sai-wan-ho': '西灣河',
    'shau-kei-wan': '筲箕灣',
    'chai-wan': '柴灣',
    'heng-fa-chuen': '杏花邨',
    'aberdeen': '香港仔',
    'ap-lei-chau': '鴨脷洲',
    'stanley': '赤柱',
    're pulse-bay': '淺水灣',
    
    // 九龍子地區
    'tsim-sha-tsui': '尖沙咀',
    'jordan': '佐敦',
    'yau-ma-tei': '油麻地',
    'mong-kok': '旺角',
    'prince-edward': '太子',
    'sham-shui-po': '深水埗',
    'cheung-sha-wan': '長沙灣',
    'hung-hom': '紅磡',
    'to-kwa-wan': '土瓜灣',
    'ho-man-tin': '何文田',
    'kowloon-tong': '九龍塘',
    'san-po-kong': '新蒲崗',
    'diamond-hill': '鑽石山',
    'lok-fu': '樂富',
    'tsz-wan-shan': '慈雲山',
    'ngau-tau-kok': '牛頭角',
    'lam-tin': '藍田',
    'kwun-tong': '觀塘',
    'yau-tong': '油塘',
    'lai-chi-kok': '荔枝角',
    'mei-foo': '美孚',
    'lai-king': '荔景',
    'kwai-fong': '葵芳',
    'kwai-chung': '葵涌',
    'tsuen-wan': '荃灣',
    'tsuen-wan-west': '荃灣西',
    
    // 新界子地區
    'sha-tin': '沙田',
    'ma-on-shan': '馬鞍山',
    'tai-wai': '大圍',
    'fo-tan': '火炭',
    'tai-po': '大埔',
    'tai-wo': '太和',
    'fan-ling': '粉嶺',
    'sheung-shui': '上水',
    'tseung-kwan-o': '將軍澳',
    'hang-hau': '坑口',
    'po-lam': '寶琳',
    'lohas-park': '康城',
    'tuen-mun': '屯門',
    'siu-hong': '兆康',
    'yuen-long': '元朗',
    'long-ping': '朗屏',
    'tin-shui-wai': '天水圍',
    'tsing-yi': '青衣',
    'kam-sheung-road': '錦上路',
    'sai-kung': '西貢',
    
    // 離島子地區
    'tung-chung': '東涌',
    'mui-wo': '梅窩',
    'tai-o': '大澳',
    'ping-chau': '坪洲',
    'cheung-chau': '長洲',
    'lamma-island': '南丫島',
    'discovery-bay': '愉景灣',
    'pui-o': '貝澳',
    
    'unlimited': '不限'
  };
  
  return subRegionMap[subRegionValue] || subRegionValue;
}; 