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
} from '@mui/material';
import { usersAPI } from '../services/api';

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
          { value: 'primary-all', label: '其他全科補習' }
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

// 地區選項
const REGION_OPTIONS = [
  '中西區','灣仔','東區','南區','油尖旺','深水埗','九龍城','黃大仙','觀塘','荃灣',
  '屯門','元朗','北區','大埔','西貢','沙田','葵青','離島','東涌','梅窩','大澳','坪洲','長洲','南丫島','愉景灣','貝澳'
];

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
      teachingSubMode: '', // 教學子模式 (單選)
      sessionRate: '',
      regions: [] as string[] // 多選
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);

  // 獲取教學模式選項
  useEffect(() => {
    const fetchTeachingModes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/teaching-modes`);
        if (response.ok) {
          const data = await response.json();
          setTeachingModeOptions(data);
          TEACHING_MODE_OPTIONS = data; // 更新全域變數
        }
      } catch (error) {
        console.error('Error fetching teaching modes:', error);
      }
    };

    fetchTeachingModes();
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

    if (formData.tutorProfile.category === 'primary-secondary' && formData.tutorProfile.subCategory) {
      const categoryWithSubCategories = category as { subCategories?: Array<{ value: string; label: string; subjects: Array<{ value: string; label: string }> }> };
      const subCategory = categoryWithSubCategories.subCategories?.find(sub => sub.value === formData.tutorProfile.subCategory);
      return subCategory?.subjects || [];
    }
    
    const categoryWithSubjects = category as { subjects: Array<{ value: string; label: string }> };
    return categoryWithSubjects.subjects || [];
  };

  // 檢查是否需要顯示地區選項
  const shouldShowRegions = () => {
    const mode = formData.tutorProfile.teachingMode;
    const subMode = formData.tutorProfile.teachingSubMode;
    return mode === 'in-person' || mode === 'both' || subMode === 'one-on-one' || subMode === 'small-group' || subMode === 'large-center';
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
          subjects: [] // 重置科目
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
          teachingSubMode: '' // 重置教學子模式
        }
      });
    } else if (name === 'teachingSubMode') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          teachingSubMode: value as string
        }
      });
    } else if (name === 'regions') {
      setFormData({
        ...formData,
        tutorProfile: {
          ...formData.tutorProfile,
          regions: value as string[]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let submitData: any = { ...formData };
      if (formData.userType === 'tutor') {
        submitData.tutorProfile = {
          category: formData.tutorProfile.category,
          subCategory: formData.tutorProfile.subCategory,
          subjects: formData.tutorProfile.subjects,
          teachingMode: formData.tutorProfile.teachingMode,
          teachingSubMode: formData.tutorProfile.teachingSubMode,
          sessionRate: Number(formData.tutorProfile.sessionRate),
          regions: formData.tutorProfile.regions
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
                <TextField
                  select
                  label="課程分類"
                  name="category"
                  value={formData.tutorProfile.category}
                  onChange={handleChange}
                  required
                >
                  {Object.entries(CATEGORY_OPTIONS).map(([key, category]) => (
                    <MenuItem key={key} value={key}>{category.label}</MenuItem>
                  ))}
                </TextField>

                {/* 子科目 (僅中小學教育顯示) */}
                {formData.tutorProfile.category === 'primary-secondary' && (
                  <TextField
                    select
                    label="子科目"
                    name="subCategory"
                    value={formData.tutorProfile.subCategory}
                    onChange={handleChange}
                    required
                  >
                    {getSubCategories().map((subCategory) => (
                      <MenuItem key={subCategory.value} value={subCategory.value}>
                        {subCategory.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* 科目 (多選) */}
                {formData.tutorProfile.category && (
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

                {/* 教學模式 */}
                <TextField
                  select
                  label="教學模式"
                  name="teachingMode"
                  value={formData.tutorProfile.teachingMode}
                  onChange={handleChange}
                  required
                >
                  {teachingModeOptions.map((mode: any) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 教學子模式 (僅面授或皆可顯示) */}
                {(formData.tutorProfile.teachingMode === 'in-person' || formData.tutorProfile.teachingMode === 'both') && (
                  <TextField
                    select
                    label="教學子模式"
                    name="teachingSubMode"
                    value={formData.tutorProfile.teachingSubMode}
                    onChange={handleChange}
                    required
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
                  <TextField
                    select
                    label="地區 (多選)"
                    name="regions"
                    SelectProps={{ multiple: true }}
                    value={formData.tutorProfile.regions}
                    onChange={handleChange}
                    required
                    helperText="可多選，按住 Ctrl/Command 鍵選多個"
                  >
                    {REGION_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
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