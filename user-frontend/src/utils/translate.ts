// 地區映射
export const REGION_MAP: { [key: string]: string } = {
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
  'tin-shui-wai': '天水圍',
  'kam-sheung-road': '錦上路',
  'fan-ling': '粉嶺',
  'chai-wan': '柴灣',
  'quarry-bay': '鰂魚涌',
  'discovery-bay': '愉景灣',
  'tai-o': '大澳',
  'fo-tan': '火炭',
  'ping-chau': '坪洲',
  'tung-chung': '東涌',
  'sai-kung': '西貢',
  'sheung-shui': '上水'
};

// 教學模式映射
export const MODE_MAP: { [key: string]: string } = {
  'online': '網課',
  'in-person': '面授'
};

// 科目映射
export const SUBJECTS: { [key: string]: { [key: string]: string } } = {
  'primary-secondary': {
    'primary-english': '英文',
    'primary-chinese': '中文',
    'primary-math': '數學',
    'secondary-english': '英文',
    'secondary-chinese': '中文',
    'secondary-math': '數學',
    'secondary-all': '全科',
    'secondary-ls': '通識'
  },
  'interest': {
    'interest-language': '語言',
    'interest-music': '音樂',
    'interest-art': '藝術',
    'interest-programming': '程式設計'
  },
  'adult': {
    'adult-business': '商業英語',
    'adult-workplace': '職場英語'
  }
};

// 獲取地區完整名稱
export const getRegionName = (region: string): string => REGION_MAP[region] || '';

// 獲取科目中文名稱
export function getSubjectNames(subjects: string[] = [], category?: string, subCategory?: string) {
  if (!subjects || subjects.length === 0) return '科目待定';
  return subjects.map(s => SUBJECT_MAP[s] || s).join('、');
}

export const getSubRegionName = (subRegion: string): string => {
  return SUBREGION_MAP[subRegion] || subRegion || '地點待定';
};

export const getModeName = (mode: string): string => MODE_MAP[mode] || '未指定';

// 科目對應
const SUBJECT_MAP: Record<string, string> = {
  "early-childhood-chinese": "幼兒中文",
  "early-childhood-english": "幼兒英文",
  "early-childhood-math": "幼兒數學",
  "early-childhood-phonics": "幼兒拼音",
  "early-childhood-logic": "幼兒邏輯",
  "early-childhood-interview": "幼兒面試",
  "early-childhood-homework": "幼兒功課輔導",
  "primary-chinese": "小學中文",
  "primary-english": "小學英文",
  "primary-math": "小學數學",
  "primary-general": "常識／常識科",
  "primary-mandarin": "普通話",
  "primary-stem": "小學STEM",
  "primary-all": "小學全科",
  "secondary-chinese": "中學中文",
  "secondary-english": "中學英文",
  "secondary-math": "中學數學",
  "secondary-ls": "通識教育",
  "secondary-physics": "物理",
  "secondary-chemistry": "化學",
  "secondary-biology": "生物",
  "secondary-economics": "經濟",
  "secondary-geography": "地理",
  "secondary-history": "歷史",
  "secondary-chinese-history": "中國歷史",
  "secondary-bafs": "企會財",
  "secondary-ict": "資訊與通訊科技",
  "secondary-integrated-science": "綜合科學",
  "secondary-dse": "DSE總溫習",
  "secondary-all": "中學全科",
  "secondary-humanities": "人文學科",
  "secondary-computer": "電腦科",
  "interest-art": "藝術",
  "interest-music": "音樂",
  "interest-dance": "舞蹈",
  "interest-drama": "戲劇",
  "interest-programming": "編程／程式",
  "interest-foreign-language": "外語",
  "interest-magic-chess": "魔術／圍棋",
  "interest-photography": "攝影",
  "interest-language": "語言興趣",
  "uni-liberal": "大學通識",
  "uni-math": "大學數學",
  "uni-economics": "大學經濟",
  "uni-it": "大學資訊科技",
  "uni-business": "大學商業課程",
  "uni-engineering": "大學工程",
  "uni-thesis": "大學論文輔導",
  "undergraduate-programming": "本科程式設計",
  "undergraduate-economics": "本科經濟",
  "undergraduate-statistics": "本科統計",
  "undergraduate-language": "本科語文",
  "undergraduate-accounting": "本科會計",
  "undergraduate-calculus": "本科微積分",
  "postgraduate-thesis": "研究生論文",
  "postgraduate-presentation": "研究生簡報",
  "postgraduate-research": "研究計劃",
  "postgraduate-spss": "SPSS分析",
  "adult-language": "成人語言",
  "adult-workplace": "職場技巧",
  "adult-business": "成人商業課程",
  "business-english": "商業英文",
  "conversation": "會話訓練",
  "chinese-language": "中文能力提升",
  "second-language": "第二語言學習",
  "computer-skills": "電腦技能",
  "exam-prep": "考試預備"
}; 