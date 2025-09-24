// 從統一配置文件導入科目分類
// 注意：此文件現在從 shared/categoryOptions.js 自動生成
// 如需修改科目配置，請編輯 shared/categoryOptions.js

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

// 統一的科目分類配置
const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    "value": "early-childhood",
    "label": "幼兒教育",
    "subjects": [
      {
        "value": "early-childhood-chinese",
        "label": "幼兒中文"
      },
      {
        "value": "early-childhood-english",
        "label": "幼兒英文"
      },
      {
        "value": "early-childhood-math",
        "label": "幼兒數學"
      },
      {
        "value": "early-childhood-phonics",
        "label": "拼音／注音"
      },
      {
        "value": "early-childhood-logic",
        "label": "邏輯思維訓練"
      },
      {
        "value": "early-childhood-interview",
        "label": "面試技巧訓練"
      },
      {
        "value": "early-childhood-homework",
        "label": "幼稚園功課輔導"
      }
    ]
  },
  {
    "value": "primary",
    "label": "小學教育",
    "subjects": [
      {
        "value": "primary-chinese",
        "label": "小學中文"
      },
      {
        "value": "primary-english",
        "label": "小學英文"
      },
      {
        "value": "primary-math",
        "label": "小學數學"
      },
      {
        "value": "primary-general",
        "label": "常識"
      },
      {
        "value": "primary-mandarin",
        "label": "普通話"
      },
      {
        "value": "primary-stem",
        "label": "STEM"
      },
      {
        "value": "primary-all",
        "label": "全科補習"
      }
    ]
  },
  {
    "value": "secondary",
    "label": "中學教育",
    "subjects": [
      {
        "value": "secondary-chinese",
        "label": "中學中文"
      },
      {
        "value": "secondary-english",
        "label": "中學英文"
      },
      {
        "value": "secondary-math",
        "label": "中學數學"
      },
      {
        "value": "secondary-ls",
        "label": "通識教育"
      },
      {
        "value": "secondary-physics",
        "label": "物理"
      },
      {
        "value": "secondary-chemistry",
        "label": "化學"
      },
      {
        "value": "secondary-biology",
        "label": "生物"
      },
      {
        "value": "secondary-economics",
        "label": "經濟"
      },
      {
        "value": "secondary-geography",
        "label": "地理"
      },
      {
        "value": "secondary-history",
        "label": "歷史"
      },
      {
        "value": "secondary-chinese-history",
        "label": "中國歷史"
      },
      {
        "value": "secondary-bafs",
        "label": "BAFS"
      },
      {
        "value": "secondary-ict",
        "label": "ICT"
      },
      {
        "value": "secondary-integrated-science",
        "label": "綜合科學"
      },
      {
        "value": "secondary-dse",
        "label": "其他 DSE 專科補習"
      },
      {
        "value": "secondary-all",
        "label": "全科補習"
      }
    ]
  },
  {
    "value": "interest",
    "label": "興趣班",
    "subjects": [
      {
        "value": "art",
        "label": "繪畫"
      },
      {
        "value": "music",
        "label": "音樂（鋼琴、結他、小提琴等）"
      },
      {
        "value": "dance",
        "label": "跳舞／舞蹈訓練"
      },
      {
        "value": "drama",
        "label": "戲劇／演講"
      },
      {
        "value": "programming",
        "label": "編程／STEM"
      },
      {
        "value": "foreign-language",
        "label": "外語（韓文／日文／法文／德文等）"
      },
      {
        "value": "magic-chess",
        "label": "魔術／棋藝"
      },
      {
        "value": "photography",
        "label": "攝影／影片剪接"
      },
      {
        "value": "piano",
        "label": "鋼琴"
      },
      {
        "value": "drawing",
        "label": "繪畫"
      },
      {
        "value": "mandarin",
        "label": "普通話"
      }
    ]
  },
  {
    "value": "tertiary",
    "label": "大專補習課程",
    "subjects": [
      {
        "value": "uni-liberal",
        "label": "大學通識"
      },
      {
        "value": "uni-math",
        "label": "大學統計與數學"
      },
      {
        "value": "uni-economics",
        "label": "經濟學"
      },
      {
        "value": "uni-it",
        "label": "資訊科技"
      },
      {
        "value": "uni-business",
        "label": "商科（會計、管理、市場學等）"
      },
      {
        "value": "uni-engineering",
        "label": "工程科目"
      },
      {
        "value": "uni-thesis",
        "label": "論文指導／報告協助"
      }
    ]
  },
  {
    "value": "adult",
    "label": "成人教育",
    "subjects": [
      {
        "value": "adult-english",
        "label": "成人英語"
      },
      {
        "value": "adult-mandarin",
        "label": "成人普通話"
      },
      {
        "value": "adult-computer",
        "label": "電腦技能"
      },
      {
        "value": "adult-business",
        "label": "商業技能"
      },
      {
        "value": "adult-language",
        "label": "外語學習"
      },
      {
        "value": "adult-hobby",
        "label": "興趣技能"
      }
    ]
  }
];

// 為了向後兼容，也提供舊的對象格式
export const CATEGORY_OPTIONS_OBJECT = CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category;
  return acc;
}, {} as Record<string, CategoryOption>);

export default CATEGORY_OPTIONS;