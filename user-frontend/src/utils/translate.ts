import { SUBJECT_MAP } from '@/constants/subjectOptions';
import { getTeachingModeLabel } from '@/constants/teachingModeOptions';

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
  // 香港島
  'central': '中環',
  'sheung-wan': '上環',
  'sai-wan': '西環',
  'sai-ying-pun': '西營盤',
  'shek-tong-tsui': '石塘咀',
  'wan-chai': '灣仔',
  'causeway-bay': '銅鑼灣',
  'admiralty': '金鐘',
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
  
  // 九龍
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
  
  // 新界
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
  'tsuen-wan': '荃灣',
  'kwai-fong': '葵芳',
  'kwai-chung': '葵涌',
  'tsing-yi': '青衣',
  'kam-sheung-road': '錦上路',
  'sai-kung': '西貢',
  
  // 離島
  'tung-chung': '東涌',
  'mui-wo': '梅窩',
  'tai-o': '大澳',
  'ping-chau': '坪洲',
  'cheung-chau': '長洲',
  'lamma-island': '南丫島',
  'discovery-bay': '愉景灣',
  'pui-o': '貝澳'
};

// 教學模式映射
export const MODE_MAP: { [key: string]: string } = {
  'online': '網課',
  'in-person': '面授',
  'one-on-one': '一對一',
  'small-group': '小班教學',
  'large-center': '大型補習社'
};

// 獲取地區完整名稱
export const getRegionName = (region: string): string => {
  return REGION_MAP[region] || region || '未指定地區';
};

// 獲取科目中文名稱 - 增強版，支援 fallback
export function getSubjectName(subject: string): string {
  if (!subject) return '未指定科目';
  
  // 先從 SUBJECT_MAP 查找
  const mappedName = SUBJECT_MAP[subject];
  if (mappedName) {
    return mappedName;
  }
  
  // 如果找不到，嘗試一些常見的 fallback 處理
  const fallbackMap: { [key: string]: string } = {
    'math': '數學',
    'english': '英文',
    'chinese': '中文',
    'physics': '物理',
    'chemistry': '化學',
    'biology': '生物',
    'economics': '經濟',
    'geography': '地理',
    'history': '歷史',
    'music': '音樂',
    'art': '美術',
    'pe': '體育',
    'computer': '電腦',
    'programming': '編程'
  };
  
  // 檢查是否包含這些關鍵字
  for (const [key, value] of Object.entries(fallbackMap)) {
    if (subject.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  // 最後的 fallback：返回原值或預設值
  return subject || '未定義科目';
}

export function getSubjectNames(subjects: string[]): string {
  if (!subjects || subjects.length === 0) return '未指定科目';
  return subjects.map(getSubjectName).join('、');
}

export const getSubRegionName = (subRegion: string): string => {
  return SUBREGION_MAP[subRegion] || subRegion || '地點待定';
};

export const getModeName = (mode: string): string => MODE_MAP[mode] || '未指定'; 