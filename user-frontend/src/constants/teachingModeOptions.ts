// 教學模式選項 - 從後端 API 獲取
export let TEACHING_MODE_OPTIONS: any[] = [];

// 初始化教學模式選項
export const initializeTeachingModeOptions = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/teaching-modes`);
    if (response.ok) {
      TEACHING_MODE_OPTIONS = await response.json();
    } else {
      // 如果 API 失敗，使用預設值
      TEACHING_MODE_OPTIONS = [
        { 
          value: 'in-person', 
          label: '面授',
          subCategories: [
            { value: 'one-on-one', label: '一對一' },
            { value: 'small-group', label: '小班教學' },
            { value: 'large-center', label: '補習社' }
          ]
        },
        { 
          value: 'online', 
          label: '網課',
          subCategories: []
        },
        { 
          value: 'both', 
          label: '皆可',
          subCategories: [
            { value: 'one-on-one', label: '一對一' },
            { value: 'small-group', label: '小班教學' },
            { value: 'large-center', label: '補習社' }
          ]
        }
      ];
    }
  } catch (error) {
    console.error('Failed to fetch teaching mode options:', error);
    // 使用預設值
    TEACHING_MODE_OPTIONS = [
      { 
        value: 'in-person', 
        label: '面授',
        subCategories: [
          { value: 'one-on-one', label: '一對一' },
          { value: 'small-group', label: '小班教學' },
          { value: 'large-center', label: '補習社' }
        ]
      },
      { 
        value: 'online', 
        label: '網課',
        subCategories: []
      },
      { 
        value: 'both', 
        label: '皆可',
        subCategories: [
          { value: 'one-on-one', label: '一對一' },
          { value: 'small-group', label: '小班教學' },
          { value: 'large-center', label: '補習社' }
        ]
      }
    ];
  }
};

// 教學模式映射（用於轉換不同格式）
export const TEACHING_MODE_MAP: { [key: string]: string } = {
  // 英文到中文
  'online': '網課',
  'in-person': '面授',
  'one-on-one': '一對一',
  'small-group': '小班教學',
  'large-center': '補習社',
  
  // 中文到英文
  '網課': 'online',
  '網上': 'online',
  '面授': 'in-person',
  '面對面': 'in-person',
  '一對一': 'one-on-one',
  '小班教學': 'small-group',
  '補習社': 'large-center',
  
  // 其他可能的格式
  '線上': 'online',
  '線下': 'in-person',
  '兩者皆可': 'both',
  '都可以': 'both'
};

// 獲取教學模式標籤
export function getTeachingModeLabel(modeCode: string): string {
  return TEACHING_MODE_MAP[modeCode] || modeCode;
}

// 獲取教學模式代碼
export function getTeachingModeCode(modeLabel: string): string {
  return TEACHING_MODE_MAP[modeLabel] || modeLabel;
}

// 驗證教學模式是否有效
export function isValidTeachingMode(mode: string): boolean {
  return TEACHING_MODE_OPTIONS.some(option => 
    option.value === mode || 
    option.subCategories.some((sub: { value: string; label: string }) => sub.value === mode)
  );
}

// 獲取教學模式的大分類
export function getTeachingModeCategory(modeCode: string): string | null {
  for (const option of TEACHING_MODE_OPTIONS) {
    if (option.value === modeCode) {
      return option.value;
    }
    if (option.subCategories.some((sub: { value: string; label: string }) => sub.value === modeCode)) {
      return option.value;
    }
  }
  return null;
}

// 檢查是否需要顯示地區選項
export function shouldShowRegionForMode(modeCode: string): boolean {
  return modeCode === 'in-person' || modeCode === 'both' || 
         ['one-on-one', 'small-group', 'large-center'].includes(modeCode);
}

export default TEACHING_MODE_OPTIONS; 