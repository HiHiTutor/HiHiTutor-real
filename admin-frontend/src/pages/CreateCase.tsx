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
import { CATEGORY_OPTIONS_OBJECT } from '../constants/categoryOptions';

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
    // 時長字段 - 與前台格式一致
    lessonDuration: {
      hours: 1,
      minutes: 0
    },
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
    return [];
  };

  const getAvailableSubjects = () => {
    if (!formData.category) return [];
    
    const category = CATEGORY_OPTIONS_OBJECT[formData.category];
    if (!category || !category.subjects) return [];
    
    return category.subjects;
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
      // 將時長轉換為分鐘
      const totalMinutes = (formData.lessonDuration.hours * 60) + formData.lessonDuration.minutes;
      
      const submitData = {
        ...formData,
        duration: totalMinutes, // 使用轉換後的總分鐘數
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
                {Object.entries(CATEGORY_OPTIONS_OBJECT).map(([value, category]) => (
                  <MenuItem key={value} value={value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


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
                </Typography>
              </Box>
            )}

            {formData.category && (
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
                fullWidth
              >
                {getAvailableSubjects().map((subject) => (
                  <MenuItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </MenuItem>
                ))}
              </TextField>
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
              label="用戶ID"
              name="userID"
              value={formData.userID}
              onChange={handleChange}
              helperText="輸入發布此案例的用戶ID"
              fullWidth
            />


            {/* 每堂時長 - 與前台格式一致 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body1" sx={{ minWidth: '100px' }}>
                每堂時長
              </Typography>
              <TextField
                type="number"
                placeholder="小時"
                value={formData.lessonDuration.hours}
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    lessonDuration: {
                      ...prev.lessonDuration,
                      hours: hours,
                      // 當小時為0時，分鐘只能選擇30或45
                      minutes: hours === 0 && ![30, 45].includes(prev.lessonDuration.minutes) 
                        ? 30 
                        : prev.lessonDuration.minutes
                    }
                  }));
                }}
                inputProps={{ min: 0, max: 12 }}
                sx={{ width: '120px' }}
              />
              <TextField
                select
                value={formData.lessonDuration.minutes}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    lessonDuration: {
                      ...prev.lessonDuration,
                      minutes: minutes
                    }
                  }));
                }}
                sx={{ width: '120px' }}
              >
                {(() => {
                  const hours = formData.lessonDuration.hours;
                  const minuteOptions = hours === 0 ? [30, 45] : [0, 15, 30, 45];
                  return minuteOptions.map(minute => (
                    <MenuItem key={minute} value={minute}>
                      {minute} 分鐘
                    </MenuItem>
                  ));
                })()}
              </TextField>
            </Box>

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
              label="備註 e.g. 屋苑"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              multiline
              rows={3}
              helperText="此內容將顯示在前台學生個案詳情頁面的「備註」欄位中"
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
