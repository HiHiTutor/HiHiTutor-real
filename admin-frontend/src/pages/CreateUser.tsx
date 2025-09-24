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
import regionService, { Region } from '../services/regionService';
import { CATEGORY_OPTIONS_OBJECT } from '../constants/categoryOptions';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

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
      categories: [] as string[], // 課程分類 (多選)
      subCategory: '', // 子科目 (單選)
      subjects: [] as string[], // 科目 (多選)
      teachingMode: '', // 教學模式 (單選)
      teachingSubModes: [] as string[], // 教學子模式 (多選)
      sessionRate: '',
      region: '', // 地區 (單選)
      subRegions: [] as string[], // 子地區 (多選)
      introduction: '', // 自我介紹
      courseFeatures: '' // 課程特色
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachingModeOptions, setTeachingModeOptions] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  // 移除舊的地區選擇狀態，改用多選框方式

  // 獲取教學模式和地區選項
  useEffect(() => {
    const fetchOptions = async () => {
      try {
                // 從後端 API 獲取教學模式選項
        try {
          const response = await api.get('/teaching-modes');
          if (response.data && Array.isArray(response.data)) {
            setTeachingModeOptions(response.data);
          } else {
            console.warn('API response data is not an array, using fallback data');
            // 如果 API 失敗或返回格式不正確，使用預設值
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

        // 從 API 載入地區選項
        await loadRegions();
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // 載入地區資料
  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const regions = await regionService.getRegions();
      console.log('✅ 地區選項載入成功:', regions);
      setRegionOptions(regions);
    } catch (error) {
      console.error('❌ 載入地區選項失敗:', error);
      // 如果API失敗，使用靜態資料作為備用
      const fallbackRegions = [
        {
          value: 'unlimited',
          label: '不限',
          regions: []
        },
        {
          value: 'all-hong-kong',
          label: '全香港',
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
            { value: 'kowloon-city', label: '九龍城' },
            { value: 'whampoa', label: '黃埔' },
            { value: 'tsz-wan-shan', label: '慈雲山' },
            { value: 'wong-tai-sin', label: '黃大仙' },
            { value: 'ngau-tau-kok', label: '牛頭角' },
            { value: 'kowloon-bay', label: '九龍灣' },
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
            { value: 'tiu-keng-leng', label: '調景嶺' },
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
      setRegionOptions(fallbackRegions);
    } finally {
      setLoadingRegions(false);
    }
  };

     // 獲取可用的子分類 (已簡化，不再需要)
   const getSubCategories = () => {
     return [];
   };
 
   // 獲取可用的科目
   const getAvailableSubjects = () => {
     if (formData.tutorProfile.categories.length === 0) return [];
     
     const allSubjects: Array<{ value: string; label: string }> = [];
     
     // 遍歷所有選擇的分類，收集科目
     formData.tutorProfile.categories.forEach(categoryKey => {
       const category = CATEGORY_OPTIONS_OBJECT[categoryKey];
       if (!category || !category.subjects) return;
       
       allSubjects.push(...category.subjects);
     });
     
     return allSubjects;
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
           (Array.isArray(subModes) && (subModes.includes('one-on-one') || subModes.includes('small-group') || subModes.includes('large-center')));
  };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
     const { name, value } = e.target;
     
     if (name === 'categories') {
       setFormData({
         ...formData,
         tutorProfile: {
           ...formData.tutorProfile,
           categories: value as string[],
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
          subjects: Array.isArray(formData.tutorProfile.subjects) ? formData.tutorProfile.subjects : []
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
     } else if (name === 'introduction') {
       setFormData({
         ...formData,
         tutorProfile: {
           ...formData.tutorProfile,
           introduction: value as string
         }
       });
     } else if (name === 'courseFeatures') {
       setFormData({
         ...formData,
         tutorProfile: {
           ...formData.tutorProfile,
           courseFeatures: value as string
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
         if (!Array.isArray(formData.tutorProfile.categories) || formData.tutorProfile.categories.length === 0) {
           setError('請選擇至少一個課程分類');
           setLoading(false);
           return;
         }
         if (!Array.isArray(formData.tutorProfile.subjects) || formData.tutorProfile.subjects.length === 0) {
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
                            (!Array.isArray(formData.tutorProfile.teachingSubModes) || formData.tutorProfile.teachingSubModes.length === 0)) {
          setError('面授模式必須選擇教學子模式');
          setLoading(false);
          return;
        }
      }

             let submitData: any = { ...formData };
       if (formData.userType === 'tutor') {
         submitData.tutorProfile = {
           categories: formData.tutorProfile.categories,
           subCategory: formData.tutorProfile.subCategory,
           subjects: Array.isArray(formData.tutorProfile.subjects) ? formData.tutorProfile.subjects : [],
           teachingMode: formData.tutorProfile.teachingMode,
           teachingSubModes: Array.isArray(formData.tutorProfile.teachingSubModes) ? formData.tutorProfile.teachingSubModes : [],
           sessionRate: Number(formData.tutorProfile.sessionRate),
           region: formData.tutorProfile.region,
           subRegions: Array.isArray(formData.tutorProfile.subRegions) ? formData.tutorProfile.subRegions : [],
           introduction: formData.tutorProfile.introduction,
           courseFeatures: formData.tutorProfile.courseFeatures
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
                   label="課程分類 (可多選)"
                   name="categories"
                   SelectProps={{ multiple: true }}
                   value={formData.tutorProfile.categories}
                   onChange={handleChange}
                   required
                   helperText="可多選，按住 Ctrl/Command 鍵選多個課程類型"
                 >
                   {Object.entries(CATEGORY_OPTIONS_OBJECT).map(([key, category]) => (
                     <MenuItem key={key} value={key}>{category.label}</MenuItem>
                   ))}
                 </TextField>


                                 {/* 科目選擇提示 */}
                 {formData.tutorProfile.categories.length > 0 && (
                   <Box sx={{ 
                     p: 1.5, 
                     backgroundColor: '#e3f2fd', 
                     borderRadius: 1, 
                     border: '1px solid #bbdefb',
                     mb: 1
                   }}>
                     <Typography variant="body2" color="primary">
                       💡 提示：您現在可以選擇可教授的科目了
                     </Typography>
                   </Box>
                 )}

                                 {/* 科目 (多選) */}
                 {formData.tutorProfile.categories.length > 0 && (
                   <TextField
                     select
                     label="可教授科目"
                     SelectProps={{ multiple: true }}
                     value={formData.tutorProfile.subjects || []}
                     onChange={(e) => {
                       const value = e.target.value;
                       setFormData({
                         ...formData,
                         tutorProfile: {
                           ...formData.tutorProfile,
                           subjects: Array.isArray(value) ? value : [value]
                         }
                       });
                     }}
                     helperText="可多選科目"
                     fullWidth
                   >
                     {getAvailableSubjects().map((subject) => (
                       <MenuItem key={subject.value} value={subject.value}>
                         {subject.label}
                       </MenuItem>
                     ))}
                   </TextField>
                 )}


                {/* 已選科目顯示 */}
                {Array.isArray(formData.tutorProfile.subjects) && formData.tutorProfile.subjects.length > 0 && (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    backgroundColor: '#f8f9fa',
                    borderLeft: '4px solid #1976d2'
                  }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      📚 已選科目 ({Array.isArray(formData.tutorProfile.subjects) ? formData.tutorProfile.subjects.length : 0}個)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.isArray(formData.tutorProfile.subjects) && formData.tutorProfile.subjects.map((subject, index) => {
                        const subjectInfo = getAvailableSubjects().find(s => s.value === subject);
                        return (
                          <Chip
                            key={index}
                            label={subjectInfo ? subjectInfo.label : subject}
                            color="primary"
                            variant="outlined"
                            size="small"
                            onDelete={() => {
                              const newSubjects = Array.isArray(formData.tutorProfile.subjects) ? formData.tutorProfile.subjects.filter((_, i) => i !== index) : [];
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
                  {Array.isArray(teachingModeOptions) && teachingModeOptions.map((mode: any) => (
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
                    value={Array.isArray(formData.tutorProfile.teachingSubModes) ? formData.tutorProfile.teachingSubModes : []}
                    onChange={handleChange}
                    required={formData.tutorProfile.teachingMode === 'in-person'} // 僅面授模式強制要求
                    helperText={formData.tutorProfile.teachingMode === 'both' ? 
                      "皆可模式：可選填，不填則表示接受所有教學方式" : 
                      "可多選，按住 Ctrl/Command 鍵選多個"}
                  >
                    {Array.isArray(teachingModeOptions) && teachingModeOptions.find((mode: any) => mode.value === formData.tutorProfile.teachingMode)?.subCategories?.map((subMode: any) => (
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

                 {/* 自我介紹 */}
                 <Box sx={{ mt: 3, mb: 2 }}>
                   <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                     📝 個人介紹
                   </Typography>
                   <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                     請填寫導師的自我介紹和課程特色
                   </Typography>
                 </Box>

                 <TextField
                   label="自我介紹"
                   name="introduction"
                   multiline
                   rows={6}
                   fullWidth
                   value={formData.tutorProfile.introduction}
                   onChange={handleChange}
                   helperText="請詳細介紹導師的教學經驗、學歷背景、教學理念等"
                   sx={{ mb: 2 }}
                 />

                 <TextField
                   label="課程特色"
                   name="courseFeatures"
                   multiline
                   rows={4}
                   fullWidth
                   value={formData.tutorProfile.courseFeatures}
                   onChange={handleChange}
                   helperText="請描述課程的獨特之處、教學方法、課程安排等"
                   sx={{ mb: 2 }}
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
                    
                    {/* 地區選擇器 - 多選框方式 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        上堂地區 (可多選)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.isArray(regionOptions) && regionOptions.map((regionOption: any) => (
                          <Box key={regionOption.value} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                              {regionOption.label}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                              {Array.isArray(regionOption.regions) && regionOption.regions.map((subRegion: any) => (
                                <Box key={subRegion.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.tutorProfile.subRegions) && formData.tutorProfile.subRegions.includes(subRegion.value)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData(prev => ({
                                          ...prev,
                                          tutorProfile: {
                                            ...prev.tutorProfile,
                                            subRegions: Array.isArray(prev.tutorProfile.subRegions) ? [...prev.tutorProfile.subRegions, subRegion.value] : [subRegion.value]
                                          }
                                        }));
                                      } else {
                                        setFormData(prev => ({
                                          ...prev,
                                          tutorProfile: {
                                            ...prev.tutorProfile,
                                            subRegions: Array.isArray(prev.tutorProfile.subRegions) ? prev.tutorProfile.subRegions.filter(sub => sub !== subRegion.value) : []
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