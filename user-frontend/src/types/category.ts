export interface Subject {
  value: string;
  label: string;
}

export interface SubCategory {
  value: string;
  label: string;
  subjects: Subject[];
}

export interface CategoryOption {
  value: string;
  label: string;
  subjects?: Subject[];
  subCategories?: SubCategory[];
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { 
    value: 'primary', 
    label: '小學',
    subjects: [
      { value: 'chinese', label: '中文' },
      { value: 'english', label: '英文' },
      { value: 'math', label: '數學' },
      { value: 'general', label: '常識' }
    ]
  },
  { 
    value: 'secondary', 
    label: '中學',
    subjects: [
      { value: 'chinese', label: '中文' },
      { value: 'english', label: '英文' },
      { value: 'math', label: '數學' },
      { value: 'physics', label: '物理' },
      { value: 'chemistry', label: '化學' },
      { value: 'biology', label: '生物' }
    ]
  },
  { 
    value: 'university', 
    label: '大學',
    subjects: [
      { value: 'business', label: '商業' },
      { value: 'engineering', label: '工程' },
      { value: 'science', label: '理學' },
      { value: 'arts', label: '文學' }
    ]
  },
  { 
    value: 'language', 
    label: '語言',
    subjects: [
      { value: 'english', label: '英語' },
      { value: 'japanese', label: '日語' },
      { value: 'korean', label: '韓語' },
      { value: 'french', label: '法語' }
    ]
  },
  { 
    value: 'music', 
    label: '音樂',
    subjects: [
      { value: 'piano', label: '鋼琴' },
      { value: 'violin', label: '小提琴' },
      { value: 'guitar', label: '結他' },
      { value: 'drums', label: '鼓' }
    ]
  },
  { 
    value: 'art', 
    label: '美術',
    subjects: [
      { value: 'drawing', label: '繪畫' },
      { value: 'painting', label: '油畫' },
      { value: 'sculpture', label: '雕塑' },
      { value: 'design', label: '設計' }
    ]
  },
  { 
    value: 'sports', 
    label: '運動',
    subjects: [
      { value: 'swimming', label: '游泳' },
      { value: 'basketball', label: '籃球' },
      { value: 'football', label: '足球' },
      { value: 'tennis', label: '網球' }
    ]
  },
  { 
    value: 'other', 
    label: '其他',
    subjects: [
      { value: 'computer', label: '電腦' },
      { value: 'cooking', label: '烹飪' },
      { value: 'dance', label: '舞蹈' },
      { value: 'photography', label: '攝影' }
    ]
  }
]; 