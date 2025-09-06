import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { casesAPI } from '../services/api';
import api from '../services/api';
import regionService, { Region } from '../services/regionService';

// 課程分類選項 - 與 CreateUser 保持一致
const CATEGORY_OPTIONS = {
  'early-childhood': {
    label: '幼兒教育',
    subjects: [
      { value: 'early-childhood-chinese', label: '幼兒中文' },
      { value: 'early-childhood-english', label: '幼兒英文' },
      { value: 'early-childhood-math', label: '幼兒數學' },
      { value: 'early-childhood-phonics', label: '拼音／注音' },
      { value: 'early-childhood-logic', label: '邏輯思維訓練' },
      { value: 'early-childhood-interview', label: '面試技巧訓練' },
      { value: 'early-childhood-homework', label: '幼稚園功課輔導' }
    ]
  },
  'primary-secondary': {
    label: '中小學教育',
    subCategories: [
      {
        value: 'primary',
        label: '小學教育',
        subjects: [
          { value: 'primary-chinese', label: '中文' },
          { value: 'primary-english', label: '英文' },
          { value: 'primary-math', label: '數學' },
          { value: 'primary-general', label: '常識' },
          { value: 'primary-mandarin', label: '普通話' },
          { value: 'primary-stem', label: '常識／STEM' },
          { value: 'primary-all', label: '全科補習' }
        ]
      },
      {
        value: 'secondary',
        label: '中學教育',
        subjects: [
          { value: 'secondary-chinese', label: '中文' },
          { value: 'secondary-english', label: '英文' },
          { value: 'secondary-math', label: '數學' },
          { value: 'secondary-ls', label: '通識教育' },
          { value: 'secondary-physics', label: '物理' },
          { value: 'secondary-chemistry', label: '化學' },
          { value: 'secondary-biology', label: '生物' },
          { value: 'secondary-economics', label: '經濟' },
          { value: 'secondary-geography', label: '地理' },
          { value: 'secondary-history', label: '歷史' },
          { value: 'secondary-chinese-history', label: '中國歷史' },
          { value: 'secondary-bafs', label: 'BAFS' },
          { value: 'secondary-ict', label: 'ICT' },
          { value: 'secondary-integrated-science', label: '綜合科學' },
          { value: 'secondary-dse', label: '其他 DSE 專科補習' },
          { value: 'secondary-all', label: '全科補習' }
        ]
      }
    ]
  },
  'interest': {
    label: '興趣班',
    subjects: [
      { value: 'art', label: '繪畫' },
      { value: 'music', label: '音樂（鋼琴、結他、小提琴等）' },
      { value: 'dance', label: '跳舞／舞蹈訓練' },
      { value: 'drama', label: '戲劇／演講' },
      { value: 'programming', label: '編程／STEM' },
      { value: 'foreign-language', label: '外語（韓文／日文／法文／德文等）' },
      { value: 'magic-chess', label: '魔術／棋藝' },
      { value: 'photography', label: '攝影／影片剪接' }
    ]
  },
  'tertiary': {
    label: '大專補習課程',
    subjects: [
      { value: 'uni-liberal', label: '大學通識' },
      { value: 'uni-math', label: '大學統計與數學' },
      { value: 'uni-economics', label: '經濟學' },
      { value: 'uni-it', label: '資訊科技' },
      { value: 'uni-business', label: '商科（會計、管理、市場學等）' },
      { value: 'uni-engineering', label: '工程科目' },
      { value: 'uni-thesis', label: '論文指導／報告協助' }
    ]
  },
  'adult': {
    label: '成人教育',
    subjects: [
      { value: 'business-english', label: '商務英文' },
      { value: 'conversation', label: '生活英語會話' },
      { value: 'chinese-language', label: '廣東話／普通話' },
      { value: 'second-language', label: '興趣／第二語言學習' },
      { value: 'computer-skills', label: '電腦技能（Excel／Photoshop 等）' },
      { value: 'exam-prep', label: '考試準備（IELTS／TOEFL／JLPT）' }
    ]
  }
};

// 地區選項 - 與 CreateUser 保持一致
const REGION_OPTIONS = [
  {
    value: 'all-hong-kong',
    label: '全港',
    regions: []
  },
  {
    value: 'hong-kong-island',
    label: '香港島',
    regions: [
      { value: 'central', label: '中環' },
      { value: 'sheung-wan', label: '上環' },
      { value: 'sai-wan', label: '西環' },
      { value: 'sai-ying-pun', label: '西營盤' },
      { value: 'shek-tong-tsui', label: '石塘咀' },
      { value: 'wan-chai', label: '灣仔' },
      { value: 'causeway-bay', label: '銅鑼灣' },
      { value: 'admiralty', label: '金鐘' },
      { value: 'happy-valley', label: '跑馬地' },
      { value: 'tin-hau', label: '天后' },
      { value: 'tai-hang', label: '大坑' },
      { value: 'north-point', label: '北角' },
      { value: 'quarry-bay', label: '鰂魚涌' },
      { value: 'taikoo', label: '太古' },
      { value: 'sai-wan-ho', label: '西灣河' },
      { value: 'shau-kei-wan', label: '筲箕灣' },
      { value: 'chai-wan', label: '柴灣' },
      { value: 'heng-fa-chuen', label: '杏花邨' }
    ]
  },
  {
    value: 'kowloon',
    label: '九龍',
    regions: [
      { value: 'tsim-sha-tsui', label: '尖沙咀' },
      { value: 'jordan', label: '佐敦' },
      { value: 'yau-ma-tei', label: '油麻地' },
      { value: 'mong-kok', label: '旺角' },
      { value: 'prince-edward', label: '太子' },
      { value: 'sham-shui-po', label: '深水埗' },
      { value: 'cheung-sha-wan', label: '長沙灣' },
      { value: 'hung-hom', label: '紅磡' },
      { value: 'to-kwa-wan', label: '土瓜灣' },
      { value: 'ho-man-tin', label: '何文田' },
      { value: 'kowloon-tong', label: '九龍塘' },
      { value: 'san-po-kong', label: '新蒲崗' },
      { value: 'diamond-hill', label: '鑽石山' },
      { value: 'lok-fu', label: '樂富' },
      { value: 'tsz-wan-shan', label: '慈雲山' },
      { value: 'ngau-tau-kok', label: '牛頭角' },
      { value: 'lam-tin', label: '藍田' },
      { value: 'kwun-tong', label: '觀塘' },
      { value: 'yau-tong', label: '油塘' }
    ]
  },
  {
    value: 'new-territories',
    label: '新界',
    regions: [
      { value: 'sha-tin', label: '沙田' },
      { value: 'ma-on-shan', label: '馬鞍山' },
      { value: 'tai-wai', label: '大圍' },
      { value: 'fo-tan', label: '火炭' },
      { value: 'tai-po', label: '大埔' },
      { value: 'tai-wo', label: '太和' },
      { value: 'fan-ling', label: '粉嶺' },
      { value: 'sheung-shui', label: '上水' },
      { value: 'tseung-kwan-o', label: '將軍澳' },
      { value: 'hang-hau', label: '坑口' },
      { value: 'po-lam', label: '寶琳' },
      { value: 'lohas-park', label: '康城' },
      { value: 'tuen-mun', label: '屯門' },
      { value: 'siu-hong', label: '兆康' },
      { value: 'yuen-long', label: '元朗' },
      { value: 'long-ping', label: '朗屏' },
      { value: 'tin-shui-wai', label: '天水圍' },
      { value: 'tsuen-wan', label: '荃灣' },
      { value: 'kwai-fong', label: '葵芳' },
      { value: 'kwai-chung', label: '葵涌' },
      { value: 'tsing-yi', label: '青衣' }
    ]
  },
  {
    value: 'islands',
    label: '離島',
    regions: [
      { value: 'tung-chung', label: '東涌' },
      { value: 'mui-wo', label: '梅窩' },
      { value: 'tai-o', label: '大澳' },
      { value: 'ping-chau', label: '坪洲' },
      { value: 'cheung-chau', label: '長洲' },
      { value: 'lamma-island', label: '南丫島' },
      { value: 'discovery-bay', label: '愉景灣' },
      { value: 'pui-o', label: '貝澳' }
    ]
  }
];

const CreateCase: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'student' as 'student',
    category: '',
    subCategory: '',
    subjects: [] as string[],
    regions: [] as string[],
    subRegions: [] as string[],
    budget: '',
    mode: '',
    modes: [] as string[],        // 新增：匹配user-frontend的modes字段
    experience: '',
    userID: '',                   // 用戶ID
    // 新增：匹配user-frontend的字段
    price: 0,                     // 價格（數字）
    duration: 60,                 // 時長（分鐘）
    durationUnit: 'minutes',      // 時長單位
    weeklyLessons: 1,             // 每週堂數
    requirement: '',              // 要求
    requirements: '',             // 要求（複數）
    region: [] as string[],       // 地區
    priceRange: '',               // 價格範圍
    featured: false,              // 特色
    isVip: false,                 // VIP
    vipLevel: 0,                  // VIP等級
    isTop: false,                 // 置頂
    topLevel: 0,                  // 置頂等級
    ratingScore: 0,               // 評分
    ratingCount: 0,               // 評分數量
    isPaid: false,                // 付費
    paymentType: 'free',          // 付費類型
    promotionLevel: 0,            // 推廣等級
    isApproved: true,             // 已審批
  });
  
  const [teachingModes, setTeachingModes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 地區資料狀態
  const [regionOptions, setRegionOptions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    loadDataSources();
    loadRegions();
  }, []);

  const loadDataSources = async () => {
    try {
      setDataLoading(true);
      
      try {
        const response = await api.get('/teaching-modes');
        if (response.data && Array.isArray(response.data)) {
          setTeachingModes(response.data);
        } else {
          const teachingModes = [
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
          setTeachingModes(teachingModes);
        }
      } catch (error) {
        console.error('Failed to fetch teaching modes:', error);
        const teachingModes = [
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
        setTeachingModes(teachingModes);
      }
    } catch (err) {
      console.error('載入數據源失敗:', err);
      setError('載入數據源失敗，請稍後重試');
    } finally {
      setDataLoading(false);
    }
  };

  // 載入地區選項
  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const regions = await regionService.getRegions();
      console.log('✅ 載入地區選項:', regions);
      setRegionOptions(regions);
    } catch (error) {
      console.error('❌ 載入地區選項失敗:', error);
      // 如果API失敗，使用靜態資料作為備用
      setRegionOptions(REGION_OPTIONS);
    } finally {
      setLoadingRegions(false);
    }
  };

  const getSubCategories = () => {
    if (formData.category === 'primary-secondary') {
      return CATEGORY_OPTIONS['primary-secondary'].subCategories || [];
    }
    return [];
  };

  const getAvailableSubjects = () => {
    if (!formData.category) return [];
    
    const category = CATEGORY_OPTIONS[formData.category as keyof typeof CATEGORY_OPTIONS];
    if (!category) return [];

    if (formData.category === 'primary-secondary') {
      const allSubjects: Array<{ value: string; label: string }> = [];
      const categoryWithSubCategories = category as { subCategories?: Array<{ value: string; label: string; subjects: Array<{ value: string; label: string }> }> };
      if (categoryWithSubCategories.subCategories) {
        categoryWithSubCategories.subCategories.forEach((subCat: { value: string; label: string; subjects: Array<{ value: string; label: string }> }) => {
          if (subCat.subjects) {
            allSubjects.push(...subCat.subjects);
          }
        });
      }
      return allSubjects;
    }
    
    const categoryWithSubjects = category as { subjects: Array<{ value: string; label: string }> };
    return categoryWithSubjects.subjects || [];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        subCategory: '',
        subjects: []
      });
    } else if (name === 'subCategory') {
      setFormData({
        ...formData,
        subCategory: value,
        subjects: Array.isArray(formData.subjects) ? formData.subjects : []
      });
    } else if (name === 'subjects') {
      setFormData({
        ...formData,
        subjects: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        subRegions: formData.subRegions || []
      };
      
      console.log('📤 提交數據:', submitData);
      
      const response = await casesAPI.createCase(submitData);
      if (response.data.success) {
        navigate('/cases');
      } else {
        setError(response.data.message || '建立案例失敗');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">建立新案例</Typography>
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          返回案例列表
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="標題"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <TextField
              label="描述"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />

            <TextField
              label="類型"
              name="type"
              value="學生案例"
              disabled
              helperText="案例類型固定為學生案例"
            />

            <FormControl fullWidth required>
              <InputLabel>課程分類</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="課程分類"
                onChange={handleSelectChange}
              >
                {Object.entries(CATEGORY_OPTIONS).map(([value, category]) => (
                  <MenuItem key={value} value={value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.category === 'primary-secondary' && (
              <TextField
                select
                label="子科目 (可選)"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleSelectChange}
                helperText="選擇特定教育階段，或留空表示可教授所有階段"
              >
                {Array.isArray(getSubCategories()) && getSubCategories().map((subCategory) => (
                  <MenuItem key={subCategory.value} value={subCategory.value}>
                    {subCategory.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {formData.category && (
              <Box sx={{ 
                p: 1.5, 
                backgroundColor: '#e3f2fd', 
                borderRadius: 1, 
                border: '1px solid #bbdefb',
                mb: 1
              }}>
                <Typography variant="body2" color="primary">
                  💡 提示：您現在可以選擇需要的科目了
                  {formData.category === 'primary-secondary' && 
                    (formData.subCategory ? 
                      `（${formData.subCategory === 'primary' ? '小學' : '中學'}階段）` : 
                      '（可跨階段選擇）'
                    )
                  }
                </Typography>
              </Box>
            )}

            {formData.category && (
              <>
                {formData.category === 'primary-secondary' ? (
                  <Box>
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      需要科目
                    </Typography>
                    
                                         <Box sx={{ mb: 2 }}>
                       <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                         🏫 小學教育科目
                       </Typography>
                       <TextField
                         select
                         label="小學科目"
                         SelectProps={{ multiple: true }}
                         value={Array.isArray(formData.subjects) ? formData.subjects.filter(subject => subject.startsWith('primary-')) : []}
                         onChange={(e) => {
                           const value = e.target.value;
                           const selectedPrimarySubjects = Array.isArray(value) ? value : [value];
                           const existingSecondarySubjects = Array.isArray(formData.subjects) ? formData.subjects.filter(subject => subject.startsWith('secondary-')) : [];
                           const allSubjects = [...selectedPrimarySubjects, ...existingSecondarySubjects];
                           setFormData({
                             ...formData,
                             subjects: allSubjects
                           });
                         }}
                         helperText="可多選小學科目"
                         fullWidth
                       >
                         {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'primary')?.subjects && Array.isArray(CATEGORY_OPTIONS['primary-secondary'].subCategories.find(sub => sub.value === 'primary')?.subjects) && CATEGORY_OPTIONS['primary-secondary'].subCategories.find(sub => sub.value === 'primary')?.subjects?.map((subject) => (
                           <MenuItem key={subject.value} value={subject.value}>
                             {subject.label}
                           </MenuItem>
                         ))}
                       </TextField>
                     </Box>

                     <Box sx={{ mb: 2 }}>
                       <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                         🎓 中學教育科目
                       </Typography>
                       <TextField
                         select
                         label="中學科目"
                         SelectProps={{ multiple: true }}
                         value={Array.isArray(formData.subjects) ? formData.subjects.filter(subject => subject.startsWith('secondary-')) : []}
                         onChange={(e) => {
                           const value = e.target.value;
                           const selectedSecondarySubjects = Array.isArray(value) ? value : [value];
                           const existingPrimarySubjects = Array.isArray(formData.subjects) ? formData.subjects.filter(subject => subject.startsWith('primary-')) : [];
                           const allSubjects = [...existingPrimarySubjects, ...selectedSecondarySubjects];
                           setFormData({
                             ...formData,
                             subjects: allSubjects
                           });
                         }}
                         helperText="可多選中學科目"
                         fullWidth
                       >
                         {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'secondary')?.subjects && Array.isArray(CATEGORY_OPTIONS['primary-secondary'].subCategories.find(sub => sub.value === 'secondary')?.subjects) && CATEGORY_OPTIONS['primary-secondary'].subCategories.find(sub => sub.value === 'secondary')?.subjects?.map((subject) => (
                           <MenuItem key={subject.value} value={subject.value}>
                             {subject.label}
                           </MenuItem>
                         ))}
                       </TextField>
                     </Box>
                  </Box>
                ) : (
                                     <TextField
                     select
                     label="需要科目"
                     name="subjects"
                     SelectProps={{ multiple: true }}
                     value={Array.isArray(formData.subjects) ? formData.subjects : []}
                     onChange={(e) => {
                       const value = e.target.value;
                       setFormData({
                         ...formData,
                         subjects: Array.isArray(value) ? value : [value]
                       });
                     }}
                     required
                     helperText="可多選，按住 Ctrl/Command 鍵選多個"
                   >
                     {Array.isArray(getAvailableSubjects()) && getAvailableSubjects().map((subject) => (
                       <MenuItem key={subject.value} value={subject.value}>
                         {subject.label}
                       </MenuItem>
                     ))}
                   </TextField>
                )}
              </>
            )}

            {Array.isArray(formData.subjects) && formData.subjects.length > 0 && (
              <Box sx={{ 
                p: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                backgroundColor: '#f8f9fa',
                borderLeft: '4px solid #1976d2'
              }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  📚 已選科目 ({Array.isArray(formData.subjects) ? formData.subjects.length : 0}個)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(formData.subjects) && formData.subjects.map((subject, index) => {
                    const subjectInfo = getAvailableSubjects().find(s => s.value === subject);
                    return (
                      <Chip
                        key={index}
                        label={subjectInfo ? subjectInfo.label : subject}
                        color="primary"
                        variant="outlined"
                        size="small"
                        onDelete={() => {
                          const newSubjects = Array.isArray(formData.subjects) ? formData.subjects.filter((_, i) => i !== index) : [];
                          setFormData({
                            ...formData,
                            subjects: newSubjects
                          });
                        }}
                        deleteIcon={<span style={{ fontSize: '14px' }}>×</span>}
                      />
                    );
                  })}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  點擊科目標籤上的 × 可移除該科目
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                🌍 地區設置
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                選擇案例適用的地區範圍
              </Typography>
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>主地區</InputLabel>
                <Select
                  name="regions"
                  value={formData.regions[0] || ''}
                  label="主地區"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      regions: value ? [value] : [],
                      subRegions: []
                    });
                  }}
                >
                  <MenuItem value="">請選擇主地區</MenuItem>
                  {regionOptions.map((regionOption) => (
                    <MenuItem key={regionOption.value} value={regionOption.value}>
                      {regionOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

                             {formData.regions[0] && formData.regions[0] !== 'all-hong-kong' && (
                 <FormControl fullWidth required>
                   <InputLabel>子地區</InputLabel>
                   <Select
                     name="subRegions"
                     multiple
                     value={Array.isArray(formData.subRegions) ? formData.subRegions : []}
                     label="子地區"
                     onChange={(e) => {
                       const value = e.target.value;
                       setFormData({
                         ...formData,
                         subRegions: Array.isArray(value) ? value : [value]
                       });
                     }}
                   >
                     {regionOptions.map((regionOption) => 
                       regionOption.regions && regionOption.regions.map((subRegion) => (
                         <MenuItem key={subRegion.value} value={subRegion.value}>
                           {regionOption.label} - {subRegion.label}
                         </MenuItem>
                       ))
                     )}
                   </Select>
                 </FormControl>
               )}
            </Box>

            <TextField
              label="預算"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>教學模式</InputLabel>
              <Select
                name="mode"
                value={formData.mode}
                label="教學模式"
                onChange={handleSelectChange}
              >
                {teachingModes.map((mode) => (
                  <MenuItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="經驗要求"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              multiline
              rows={2}
            />

            <TextField
              label="用戶ID"
              name="userID"
              value={formData.userID}
              onChange={handleChange}
              helperText="輸入發布此案例的用戶ID"
              fullWidth
            />

            <TextField
              label="價格"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              helperText="輸入價格（數字）"
              fullWidth
            />

            <TextField
              label="時長（分鐘）"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              helperText="輸入課程時長（分鐘）"
              fullWidth
            />

            <TextField
              label="每週堂數"
              name="weeklyLessons"
              type="number"
              value={formData.weeklyLessons}
              onChange={handleChange}
              helperText="輸入每週上課次數"
              fullWidth
            />

            <TextField
              label="要求"
              name="requirement"
              value={formData.requirement}
              onChange={handleChange}
              multiline
              rows={2}
              helperText="輸入課程要求"
              fullWidth
            />

            <TextField
              label="要求（複數）"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              multiline
              rows={2}
              helperText="輸入課程要求（複數）"
              fullWidth
            />

            <TextField
              label="價格範圍"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              helperText="輸入價格範圍（如：100-200）"
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                }
                label="特色案例"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isVip"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                  />
                }
                label="VIP案例"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isTop"
                    checked={formData.isTop}
                    onChange={(e) => setFormData({...formData, isTop: e.target.checked})}
                  />
                }
                label="置頂案例"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="VIP等級"
                name="vipLevel"
                type="number"
                value={formData.vipLevel}
                onChange={handleChange}
                helperText="VIP等級（0-2）"
                sx={{ flex: 1 }}
              />
              <TextField
                label="置頂等級"
                name="topLevel"
                type="number"
                value={formData.topLevel}
                onChange={handleChange}
                helperText="置頂等級（0-2）"
                sx={{ flex: 1 }}
              />
              <TextField
                label="推廣等級"
                name="promotionLevel"
                type="number"
                value={formData.promotionLevel}
                onChange={handleChange}
                helperText="推廣等級（0-5）"
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="評分"
                name="ratingScore"
                type="number"
                value={formData.ratingScore}
                onChange={handleChange}
                helperText="評分（0-5）"
                sx={{ flex: 1 }}
              />
              <TextField
                label="評分數量"
                name="ratingCount"
                type="number"
                value={formData.ratingCount}
                onChange={handleChange}
                helperText="評分數量"
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>付費類型</InputLabel>
              <Select
                name="paymentType"
                value={formData.paymentType}
                label="付費類型"
                onChange={handleSelectChange}
              >
                <MenuItem value="free">免費</MenuItem>
                <MenuItem value="basic">基本</MenuItem>
                <MenuItem value="premium">高級</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                  />
                }
                label="付費案例"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({...formData, isApproved: e.target.checked})}
                  />
                }
                label="已審批"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : '建立案例'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/cases')}
                disabled={loading}
              >
                取消
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateCase;
