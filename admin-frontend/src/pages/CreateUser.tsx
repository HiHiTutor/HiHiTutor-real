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
} from '@mui/material';
import { usersAPI } from '../services/api';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

// 課程分類選項
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

// 教學模式選項 - 將從 API 獲取
let TEACHING_MODE_OPTIONS: any[] = [];

// 地區選項 - 將從 API 獲取
let REGION_OPTIONS: any[] = [];

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'student',
    tutorProfile: {
      category: '', // 課程分類 (單選)
      subCategory: '', // 子科目 (單選)
      subjects: [] as string[], // 科目 (多選)
      teachingMode: '', // 教學模式 (單選)
      teachingSubModes: [] as string[], // 教學子模式 (多選)
      sessionRate: '',
      region: '', // 地區 (單選)
      subRegions: [] as string[] // 子地區 (多選)
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<any[]>([]);
  // 移除舊的地區選擇狀態，改用多選框方式

  // 獲取教學模式和地區選項
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 從後端 API 獲取教學模式選項
        try {
          const response = await api.get('/teaching-modes');
          if (response.data) {
            setTeachingModeOptions(response.data);
          } else {
            // 如果 API 失敗，使用預設值
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
            setTeachingModeOptions(teachingModes);
          }
        } catch (error) {
          console.error('Failed to fetch teaching modes:', error);
          // 使用預設值
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
          setTeachingModeOptions(teachingModes);
        }

        // 暫時使用硬編碼的地區選項，等 API 修復後改回動態獲取
        const regions = [
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
        setRegionOptions(regions);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // 獲取可用的子分類
  const getSubCategories = () => {
    if (formData.tutorProfile.category === 'primary-secondary') {
      return CATEGORY_OPTIONS['primary-secondary'].subCategories || [];
    }
    return [];
  };

  // 獲取可用的科目
  const getAvailableSubjects = () => {
    if (!formData.tutorProfile.category) return [];
    
    const category = CATEGORY_OPTIONS[formData.tutorProfile.category as keyof typeof CATEGORY_OPTIONS];
    if (!category) return [];

    if (formData.tutorProfile.category === 'primary-secondary') {
      // 中小學教育：顯示所有子科目的科目，允許跨子科目選擇
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

  // 檢查是否需要顯示地區選項
  const shouldShowRegions = () => {
    const mode = formData.tutorProfile.teachingMode;
    // 如果選擇"皆可"，則不需要強制選擇教學子模式
    if (mode === 'both') {
      return true; // 皆可模式顯示地區選項
    }
    const subModes = formData.tutorProfile.teachingSubModes;
    return mode === 'in-person' || 
           subModes.includes('one-on-one') || subModes.includes('small-group') || subModes.includes('large-center');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          category: value as string,
          subCategory: '', // 重置子分類
          subjects: [] // 重置科目
        }
      });
    } else if (name === 'subCategory') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          subCategory: value as string,
          // 不清空已選科目，讓用戶可以跨子科目選擇
          subjects: formData.tutorProfile.subjects
        }
      });
    } else if (name === 'subjects') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          subjects: value as string[]
        }
      });
    } else if (name === 'teachingMode') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          teachingMode: value as string,
          teachingSubModes: [] // 重置教學子模式
        }
      });
    } else if (name === 'teachingSubModes') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          teachingSubModes: value as string[]
        }
      });
    } else if (name === 'region') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          region: value as string,
          subRegions: [] // 重置子地區
        }
      });
    } else if (name === 'subRegions') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          subRegions: value as string[]
        }
      });
    } else if (name === 'sessionRate') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          sessionRate: value as string
        }
      });
    } else {
      setFormData({
        ...formData,
        [name as string]: value as string
      });
    }
  };

  // 移除舊的地區處理函數，改用多選框方式

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 前端驗證
      if (formData.userType === 'tutor') {
        if (!formData.tutorProfile.category) {
          setError('請選擇課程分類');
          setLoading(false);
          return;
        }
        if (!formData.tutorProfile.subjects || formData.tutorProfile.subjects.length === 0) {
          setError('請至少選擇一個可教授科目');
          setLoading(false);
          return;
        }
        if (!formData.tutorProfile.teachingMode) {
          setError('請選擇教學模式');
          setLoading(false);
          return;
        }
        if (!formData.tutorProfile.sessionRate || Number(formData.tutorProfile.sessionRate) < 100) {
          setError('堂費不能少於100元');
          setLoading(false);
          return;
        }
        // 如果選擇面授模式，必須選擇教學子模式
        if (formData.tutorProfile.teachingMode === 'in-person' && 
            (!formData.tutorProfile.teachingSubModes || formData.tutorProfile.teachingSubModes.length === 0)) {
          setError('面授模式必須選擇教學子模式');
          setLoading(false);
          return;
        }
      }

      let submitData: any = { ...formData };
      if (formData.userType === 'tutor') {
        submitData.tutorProfile = {
          category: formData.tutorProfile.category,
          subCategory: formData.tutorProfile.subCategory,
          subjects: formData.tutorProfile.subjects,
          teachingMode: formData.tutorProfile.teachingMode,
          teachingSubModes: formData.tutorProfile.teachingSubModes,
          sessionRate: Number(formData.tutorProfile.sessionRate),
          region: formData.tutorProfile.region,
          subRegions: formData.tutorProfile.subRegions
        };
      } else {
        delete submitData.tutorProfile;
      }
      const response = await usersAPI.createUser(submitData);
      if (response.data.success) {
        navigate('/users');
      } else {
        setError(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Create New User</Typography>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          Back to Users
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              select
              label="User Type"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>

            {/* Tutor 專用欄位 */}
            {formData.userType === 'tutor' && (
              <>
                {/* 課程分類 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    📚 課程設置
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    請按順序選擇：課程分類 → 子科目(可選) → 可教授科目
                  </Typography>
                </Box>
                
                <TextField
                  select
                  label="課程分類"
                  name="category"
                  value={formData.tutorProfile.category}
                  onChange={handleChange}
                  required
                  helperText="選擇您要教授的課程類型"
                >
                  {Object.entries(CATEGORY_OPTIONS).map(([key, category]) => (
                    <MenuItem key={key} value={key}>{category.label}</MenuItem>
                  ))}
                </TextField>

                {/* 子科目 (僅中小學教育顯示，可選) */}
                {formData.tutorProfile.category === 'primary-secondary' && (
                  <TextField
                    select
                    label="子科目 (可選)"
                    name="subCategory"
                    value={formData.tutorProfile.subCategory}
                    onChange={handleChange}
                    helperText="選擇特定教育階段，或留空表示可教授所有階段"
                  >
                    {getSubCategories().map((subCategory) => (
                      <MenuItem key={subCategory.value} value={subCategory.value}>
                        {subCategory.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* 科目選擇提示 */}
                {formData.tutorProfile.category && (
                  <Box sx={{ 
                    p: 1.5, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 1, 
                    border: '1px solid #bbdefb',
                    mb: 1
                  }}>
                    <Typography variant="body2" color="primary">
                      💡 提示：您現在可以選擇可教授的科目了
                      {formData.tutorProfile.category === 'primary-secondary' && 
                        (formData.tutorProfile.subCategory ? 
                          `（${formData.tutorProfile.subCategory === 'primary' ? '小學' : '中學'}階段）` : 
                          '（可跨階段選擇）'
                        )
                      }
                    </Typography>
                  </Box>
                )}

                {/* 科目 (多選) */}
                {formData.tutorProfile.category && (
                  <>
                    {formData.tutorProfile.category === 'primary-secondary' ? (
                      // 中小學教育：分組顯示科目
                      <Box>
                        <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                          可教授科目 (多選)
                        </Typography>
                        
                        {/* 小學教育科目 */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            🏫 小學教育科目
                          </Typography>
                          <TextField
                            select
                            label="小學科目"
                            SelectProps={{ multiple: true }}
                            value={formData.tutorProfile.subjects.filter(subject => subject.startsWith('primary-'))}
                            onChange={(e) => {
                              const value = e.target.value;
                              const selectedPrimarySubjects = Array.isArray(value) ? value : [value];
                              const existingSecondarySubjects = formData.tutorProfile.subjects.filter(subject => subject.startsWith('secondary-'));
                              const allSubjects = [...selectedPrimarySubjects, ...existingSecondarySubjects];
                              setFormData({
                                ...formData,
                                tutorProfile: {
                                  ...formData.tutorProfile,
                                  subjects: allSubjects
                                }
                              });
                            }}
                            helperText="可多選小學科目"
                            fullWidth
                          >
                            {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'primary')?.subjects?.map((subject) => (
                              <MenuItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        {/* 中學教育科目 */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            🎓 中學教育科目
                          </Typography>
                          <TextField
                            select
                            label="中學科目"
                            SelectProps={{ multiple: true }}
                            value={formData.tutorProfile.subjects.filter(subject => subject.startsWith('secondary-'))}
                            onChange={(e) => {
                              const value = e.target.value;
                              const selectedSecondarySubjects = Array.isArray(value) ? value : [value];
                              const existingPrimarySubjects = formData.tutorProfile.subjects.filter(subject => subject.startsWith('primary-'));
                              const allSubjects = [...existingPrimarySubjects, ...selectedSecondarySubjects];
                              setFormData({
                                ...formData,
                                tutorProfile: {
                                  ...formData.tutorProfile,
                                  subjects: allSubjects
                                }
                              });
                            }}
                            helperText="可多選中學科目"
                            fullWidth
                          >
                            {CATEGORY_OPTIONS['primary-secondary'].subCategories?.find(sub => sub.value === 'secondary')?.subjects?.map((subject) => (
                              <MenuItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                    ) : (
                      // 其他課程分類：正常顯示
                      <TextField
                        select
                        label="可教授科目 (多選)"
                        name="subjects"
                        SelectProps={{ multiple: true }}
                        value={formData.tutorProfile.subjects}
                        onChange={handleChange}
                        required
                        helperText="可多選，按住 Ctrl/Command 鍵選多個"
                      >
                        {getAvailableSubjects().map((subject) => (
                          <MenuItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </>
                )}

                {/* 已選科目顯示 */}
                {formData.tutorProfile.subjects && formData.tutorProfile.subjects.length > 0 && (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    backgroundColor: '#f8f9fa',
                    borderLeft: '4px solid #1976d2'
                  }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      📚 已選科目 ({formData.tutorProfile.subjects.length}個)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tutorProfile.subjects.map((subject, index) => {
                        const subjectInfo = getAvailableSubjects().find(s => s.value === subject);
                        return (
                          <Chip
                            key={index}
                            label={subjectInfo ? subjectInfo.label : subject}
                            color="primary"
                            variant="outlined"
                            size="small"
                            onDelete={() => {
                              const newSubjects = formData.tutorProfile.subjects.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                tutorProfile: {
                                  ...formData.tutorProfile,
                                  subjects: newSubjects
                                }
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

                {/* 教學模式 */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    🎯 教學設置
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    選擇您的教學方式和相關設置
                  </Typography>
                </Box>
                
                <TextField
                  select
                  label="教學模式"
                  name="teachingMode"
                  value={formData.tutorProfile.teachingMode}
                  onChange={handleChange}
                  required
                  helperText="選擇您偏好的教學方式"
                >
                  {teachingModeOptions.map((mode: any) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 教學子模式 (僅面授或皆可顯示，但皆可模式不強制要求) */}
                {(formData.tutorProfile.teachingMode === 'in-person' || formData.tutorProfile.teachingMode === 'both') && (
                  <TextField
                    select
                    label="教學子模式 (多選)"
                    name="teachingSubModes"
                    SelectProps={{ multiple: true }}
                    value={formData.tutorProfile.teachingSubModes}
                    onChange={handleChange}
                    required={formData.tutorProfile.teachingMode === 'in-person'} // 僅面授模式強制要求
                    helperText={formData.tutorProfile.teachingMode === 'both' ? 
                      "皆可模式：可選填，不填則表示接受所有教學方式" : 
                      "可多選，按住 Ctrl/Command 鍵選多個"}
                  >
                    {teachingModeOptions.find((mode: any) => mode.value === formData.tutorProfile.teachingMode)?.subCategories?.map((subMode: any) => (
                      <MenuItem key={subMode.value} value={subMode.value}>
                        {subMode.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <TextField
                  label="時薪 (sessionRate)"
                  name="sessionRate"
                  type="number"
                  value={formData.tutorProfile.sessionRate}
                  onChange={handleChange}
                  required
                  helperText="堂費不能少於 100 元"
                />

                {/* 地區 (僅面授或特定子模式顯示) */}
                {shouldShowRegions() && (
                  <>
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        🌍 地區設置
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        選擇您提供服務的地區範圍
                      </Typography>
                    </Box>
                    
                    {/* 地區選擇 */}
                    <TextField
                      select
                      label="地區"
                      name="region"
                      value={formData.tutorProfile.region}
                      onChange={handleChange}
                      required
                      helperText="選擇主要服務地區"
                    >
                      {regionOptions.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* 子地區選擇 (支持跨大區) */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        選擇子地區 (可跨大區選擇)
                      </Typography>
                      
                      {/* 地區選擇器 - 多選框方式 */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                          上堂地區 (可多選)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {regionOptions.map((regionOption: any) => (
                            <Box key={regionOption.value} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {regionOption.label}
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                                {regionOption.regions?.map((subRegion: any) => (
                                  <Box key={subRegion.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={formData.tutorProfile.subRegions.includes(subRegion.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({
                                            ...prev,
                                            tutorProfile: {
                                              ...prev.tutorProfile,
                                              subRegions: [...prev.tutorProfile.subRegions, subRegion.value]
                                            }
                                          }));
                                        } else {
                                          setFormData(prev => ({
                                            ...prev,
                                            tutorProfile: {
                                              ...prev.tutorProfile,
                                              subRegions: prev.tutorProfile.subRegions.filter(sub => sub !== subRegion.value)
                                            }
                                          }));
                                        }
                                      }}
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '4px',
                                        border: '1px solid #d1d5db',
                                        accentColor: '#3b82f6'
                                      }}
                                    />
                                    <Typography variant="body2" color="textSecondary">
                                      {subRegion.label}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create User'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser; 