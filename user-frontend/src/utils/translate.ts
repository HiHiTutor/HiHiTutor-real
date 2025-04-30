// 地區映射
export const REGIONS: { [key: string]: string } = {
  'hong-kong-island': '香港島',
  'kowloon': '九龍',
  'new-territories': '新界',
  'islands': '離島'
};

// 子地區映射
export const SUB_REGIONS: { [key: string]: { [key: string]: string } } = {
  'hong-kong-island': {
    'central-western': '中西區',
    'wan-chai': '灣仔區',
    'eastern': '東區',
    'southern': '南區',
    'sai-ying-pun': '西營盤'
  },
  'kowloon': {
    'yau-tsim-mong': '油尖旺區',
    'sham-shui-po': '深水埗區',
    'kowloon-city': '九龍城區',
    'wong-tai-sin': '黃大仙區',
    'kwun-tong': '觀塘區'
  },
  'new-territories': {
    'kwai-tsing': '葵青區',
    'tuen-mun': '屯門區',
    'yuen-long': '元朗區',
    'north': '北區',
    'tai-po': '大埔區',
    'sha-tin': '沙田區',
    'sai-kung': '西貢區'
  },
  'islands': {
    'islands': '離島區',
    'discovery-bay': '愉景灣'
  }
};

// 子地區映射
export const SUBREGION_MAP: Record<string, string> = {
  'sai-ying-pun': '西營盤',
  'sheung-shui': '上水',
  'fan-ling': '粉嶺',
  'tai-po': '大埔',
  'sha-tin': '沙田',
  'ma-on-shan': '馬鞍山',
  'tseung-kwan-o': '將軍澳',
  'kwun-tong': '觀塘',
  'yau-tong': '油塘',
  'lam-tin': '藍田',
  'tuen-mun': '屯門',
  'yuen-long': '元朗',
  'tin-shui-wai': '天水圍',
  'tai-wai': '大圍',
  'fo-tan': '火炭',
  'tai-wo-hau': '大窩口',
  'kwai-fong': '葵芳',
  'kwai-hing': '葵興',
  'tsuen-wan': '荃灣',
  'tsing-yi': '青衣',
  'discovery-bay': '愉景灣',
  'tung-chung': '東涌',
  'central': '中環',
  'wan-chai': '灣仔',
  'causeway-bay': '銅鑼灣',
  'north-point': '北角',
  'quarry-bay': '鰂魚涌',
  'chai-wan': '柴灣',
  'aberdeen': '香港仔',
  'ap-lei-chau': '鴨脷洲',
  'stanley': '赤柱',
  'reclamation': '金鐘',
  'admiralty': '金鐘',
  'tai-kok-tsui': '大角咀',
  'mong-kok': '旺角',
  'yau-ma-tei': '油麻地',
  'to-kei-wan': '土瓜灣',
  'hung-hom': '紅磡',
  'ho-man-tin': '何文田',
  'san-po-kong': '新蒲崗',
  'diamond-hill': '鑽石山',
  'wong-tai-sin': '黃大仙',
  'choi-hung': '彩虹',
  'ngau-tau-kok': '牛頭角',
  'yau-tong': '油塘',
  'lam-tin': '藍田',
  'tseung-kwan-o': '將軍澳',
  'po-lam': '寶琳',
  'hang-hau': '坑口',
  'tseung-kwan-o': '將軍澳',
  'tung-chung': '東涌',
  'discovery-bay': '愉景灣',
  'cheung-chau': '長洲',
  'lamma-island': '南丫島',
  'ma-wan': '馬灣',
  'peng-chau': '坪洲'
};

// 教學模式映射
export const MODES: { [key: string]: string } = {
  'online': '網課',
  'in-person': '面授'
};

// 科目映射
export const SUBJECTS: { [key: string]: { [key: string]: string } } = {
  'preschool': {
    'preschool-chinese': '幼兒 - 中文',
    'preschool-english': '幼兒 - 英文',
    'preschool-math': '幼兒 - 數學'
  },
  'primary': {
    'primary-chinese': '小學 - 中文',
    'primary-english': '小學 - 英文',
    'primary-math': '小學 - 數學',
    'primary-general': '小學 - 常識',
    'primary-stem': '小學 - STEM'
  },
  'secondary': {
    'secondary-chinese': '中學 - 中文',
    'secondary-english': '中學 - 英文',
    'secondary-math': '中學 - 數學',
    'secondary-ls': '中學 - 通識教育',
    'secondary-humanities': '中學 - 人文學科',
    'secondary-economics': '中學 - 經濟',
    'secondary-computer': '中學 - 電腦',
    'secondary-dse': '中學 - DSE',
    'secondary-all': '中學 - 全科'
  },
  'undergraduate': {
    'undergraduate-calculus': '大學 - 微積分',
    'undergraduate-economics': '大學 - 經濟學',
    'undergraduate-statistics': '大學 - 統計學',
    'undergraduate-accounting': '大學 - 會計學',
    'undergraduate-programming': '大學 - 程式設計',
    'undergraduate-language': '大學 - 語言課程'
  },
  'postgraduate': {
    'postgraduate-thesis': '研究生 - 論文寫作',
    'postgraduate-research': '研究生 - 研究方法',
    'postgraduate-spss': '研究生 - SPSS',
    'postgraduate-presentation': '研究生 - 學術簡報'
  },
  'interest': {
    'interest-music': '興趣 - 音樂',
    'interest-art': '興趣 - 藝術',
    'interest-programming': '興趣 - 程式設計',
    'interest-language': '興趣 - 語言'
  },
  'adult': {
    'adult-business': '成人 - 商業英語',
    'adult-language': '成人 - 語言課程',
    'adult-workplace': '成人 - 職場英語'
  }
};

// 獲取地區完整名稱
export const getFullRegionName = (region: string, subRegion: string): string => {
  const mainRegion = REGIONS[region] || region;
  const subRegionName = SUB_REGIONS[region]?.[subRegion] || subRegion;
  return `${mainRegion} - ${subRegionName}`;
};

// 獲取科目中文名稱
export const getSubjectNames = (
  subjects: string[] = [], // 預設為空陣列
  category: string,
  subCategory: string
): string => {
  const subjectMap = SUBJECTS[subCategory] || SUBJECTS[category] || {};
  return subjects.map(subject => subjectMap[subject] || subject).join('、');
};

export const getSubRegionName = (subRegion: string): string => {
  return SUBREGION_MAP[subRegion] || subRegion || '地點待定';
}; 