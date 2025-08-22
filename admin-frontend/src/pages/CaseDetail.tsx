import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setSelectedCase, setLoading, setError } from '../store/slices/caseSlice';
import { Case } from '../types/case';
import {
  getCategoryLabel,
  getSubCategoryLabel,
  getStatusLabel,
  getTypeLabel,
  getModeLabel,
  getExperienceLabel,
  getSubjectLabel,
  getRegionLabel,
  getSubRegionLabel,
} from '../utils/translations';

// 課程分類選項 - 與 CreateCase 保持一致
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

// 地區選項 - 與 CreateCase 保持一致
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

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { selectedCase, loading, error } = useAppSelector((state) => state.cases);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        dispatch(setLoading(true));
        if (id) {
          const searchParams = new URLSearchParams(location.search);
          const type = searchParams.get('type');
          const response = await casesAPI.getCaseById(id, type || undefined);
          const { success, data } = response.data;
          
          if (success && data.case) {
            dispatch(setSelectedCase(data.case));
            setEditData(data.case);
          } else {
            dispatch(setError('找不到案例'));
          }
        }
      } catch (error: any) {
        dispatch(setError(error.message || '獲取案例詳情失敗'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCase();
  }, [dispatch, id, location.search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'matched':
        return 'success';
      case 'closed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSubCategories = () => {
    if (editData.category === 'primary-secondary') {
      return CATEGORY_OPTIONS['primary-secondary'].subCategories || [];
    }
    return [];
  };

  const getAvailableSubjects = () => {
    if (!editData.category) return [];
    
    const category = CATEGORY_OPTIONS[editData.category as keyof typeof CATEGORY_OPTIONS];
    if (!category) return [];

    if (editData.category === 'primary-secondary') {
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setEditData({
        ...editData,
        category: value,
        subCategory: '',
        subjects: []
      });
    } else if (name === 'subCategory') {
      setEditData({
        ...editData,
        subCategory: value,
        subjects: Array.isArray(editData.subjects) ? editData.subjects : []
      });
    } else if (name === 'subjects') {
      setEditData({
        ...editData,
        subjects: value
      });
    } else if (name === 'regions') {
      setEditData({
        ...editData,
        regions: value ? [value] : [],
        subRegions: []
      });
    } else if (name === 'subRegions') {
      setEditData({
        ...editData,
        subRegions: Array.isArray(value) ? value : [value]
      });
    } else {
      setEditData({
        ...editData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      setEditLoading(true);
      setEditError(null);
      
      // 添加調試信息
      console.log('🔍 準備提交的編輯數據:', editData);
      console.log('🔍 案例ID:', id);
      
      // 從 URL 參數中獲取案例類型
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      
      console.log('🔍 案例類型:', type);
      console.log('🔍 URL 參數:', location.search);
      
      const response = await casesAPI.updateCase(id!, editData, type || undefined);
      if (response.data.success) {
        console.log('✅ 案例更新成功:', response.data);
        dispatch(setSelectedCase(editData));
        setIsEditing(false);
        // 重新獲取案例數據
        const refreshResponse = await casesAPI.getCaseById(id!, location.search.includes('type=student') ? 'student' : undefined);
        if (refreshResponse.data.success && refreshResponse.data.data.case) {
          dispatch(setSelectedCase(refreshResponse.data.data.case));
          setEditData(refreshResponse.data.data.case);
        }
      } else {
        console.error('❌ 案例更新失敗:', response.data);
        setEditError(response.data.message || '更新失敗');
      }
    } catch (error: any) {
      console.error('❌ 案例更新異常:', error);
      console.error('❌ 錯誤響應:', error.response);
      console.error('❌ 錯誤數據:', error.response?.data);
      setEditError(error.response?.data?.message || '更新失敗');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(selectedCase);
    setIsEditing(false);
    setEditError(null);
  };

  // 檢查是否為線上教學
  const isOnlineMode = selectedCase?.mode === 'online' || selectedCase?.mode === '網上教學';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!selectedCase) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">找不到案例</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">案例詳情</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditing && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              編輯案例
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/cases')}>
            返回案例列表
          </Button>
        </Box>
      </Box>

      {editError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {editError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {isEditing ? (
          // 編輯模式
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="標題"
              name="title"
              value={editData.title || ''}
              onChange={handleEditChange}
              required
              fullWidth
            />
            
            <TextField
              label="描述"
              name="description"
              value={editData.description || ''}
              onChange={handleEditChange}
              multiline
              rows={4}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>課程分類</InputLabel>
              <Select
                name="category"
                value={editData.category || ''}
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

            {editData.category === 'primary-secondary' && (
              <TextField
                select
                label="子科目 (可選)"
                name="subCategory"
                value={editData.subCategory || ''}
                onChange={handleSelectChange}
                helperText="選擇特定教育階段，或留空表示可教授所有階段"
                fullWidth
              >
                <MenuItem value="">不選擇</MenuItem>
                {Array.isArray(getSubCategories()) && getSubCategories().map((subCategory) => (
                  <MenuItem key={subCategory.value} value={subCategory.value}>
                    {subCategory.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {editData.category && (
              <>
                {editData.category === 'primary-secondary' ? (
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
                                                 value={Array.isArray(editData.subjects) ? editData.subjects.filter((subject: string) => subject.startsWith('primary-')) : []}
                        onChange={(e) => {
                          const value = e.target.value;
                          const selectedPrimarySubjects = Array.isArray(value) ? value : [value];
                                                     const existingSecondarySubjects = Array.isArray(editData.subjects) ? editData.subjects.filter((subject: string) => subject.startsWith('secondary-')) : [];
                          const allSubjects = [...selectedPrimarySubjects, ...existingSecondarySubjects];
                          setEditData({
                            ...editData,
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
                                                 value={Array.isArray(editData.subjects) ? editData.subjects.filter((subject: string) => subject.startsWith('secondary-')) : []}
                        onChange={(e) => {
                          const value = e.target.value;
                          const selectedSecondarySubjects = Array.isArray(value) ? value : [value];
                                                     const existingPrimarySubjects = Array.isArray(editData.subjects) ? editData.subjects.filter((subject: string) => subject.startsWith('primary-')) : [];
                          const allSubjects = [...existingPrimarySubjects, ...selectedSecondarySubjects];
                          setEditData({
                            ...editData,
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
                    value={Array.isArray(editData.subjects) ? editData.subjects : []}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditData({
                        ...editData,
                        subjects: Array.isArray(value) ? value : [value]
                      });
                    }}
                    required
                    helperText="可多選，按住 Ctrl/Command 鍵選多個"
                    fullWidth
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

            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                🌍 地區設置
              </Typography>
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>主地區</InputLabel>
                <Select
                  name="regions"
                  value={editData.regions?.[0] || ''}
                  label="主地區"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">請選擇主地區</MenuItem>
                  {REGION_OPTIONS.map((regionOption) => (
                    <MenuItem key={regionOption.value} value={regionOption.value}>
                      {regionOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {editData.regions?.[0] && editData.regions[0] !== 'all-hong-kong' && (
                <FormControl fullWidth required>
                  <InputLabel>子地區</InputLabel>
                  <Select
                    name="subRegions"
                    multiple
                    value={Array.isArray(editData.subRegions) ? editData.subRegions : []}
                    label="子地區"
                    onChange={handleSelectChange}
                  >
                    {REGION_OPTIONS.map((regionOption) => 
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
              value={editData.budget || ''}
              onChange={handleEditChange}
              required
              fullWidth
            />

            <TextField
              label="經驗要求"
              name="experience"
              value={editData.experience || ''}
              onChange={handleEditChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="發布者ID"
              name="posterId"
              value={editData.posterId || ''}
              onChange={handleEditChange}
              helperText="發布此案例的用戶ID"
              fullWidth
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={editLoading}
              >
                {editLoading ? <CircularProgress size={24} /> : '保存更改'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={editLoading}
              >
                取消編輯
              </Button>
            </Box>
          </Box>
        ) : (
          // 查看模式
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {selectedCase.title}
              </Typography>
              <Chip
                label={getStatusLabel(selectedCase.status)}
                color={getStatusColor(selectedCase.status)}
                sx={{ mr: 1 }}
              />
              <Chip label={getTypeLabel(selectedCase.type)} color="secondary" />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                描述
              </Typography>
              <Typography>{selectedCase.description}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                分類
              </Typography>
              <Typography>{getCategoryLabel(selectedCase.category)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                子分類
              </Typography>
              <Typography>{selectedCase.subCategory ? getSubCategoryLabel(selectedCase.subCategory) : '不適用'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                科目
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedCase.subjects?.map((subject) => (
                  <Chip key={subject} label={getSubjectLabel(subject)} />
                ))}
              </Box>
            </Grid>

            {/* 地區信息 - 只在非線上教學時顯示 */}
            {!isOnlineMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    地區
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedCase.regions?.map((region) => (
                      <Chip key={region} label={getRegionLabel(region)} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    子地區
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedCase.subRegions?.map((subRegion) => (
                      <Chip key={subRegion} label={getSubRegionLabel(subRegion)} />
                    ))}
                  </Box>
                </Grid>
              </>
            )}

            {/* 線上教學時顯示適用地區 */}
            {isOnlineMode && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  適用地區
                </Typography>
                <Typography color="textSecondary">
                  線上教學，全港適用
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                預算
              </Typography>
              <Typography>{selectedCase.budget}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                教學模式
              </Typography>
              <Typography>{getModeLabel(selectedCase.mode)}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                經驗要求
              </Typography>
              <Typography>{selectedCase.experience ? getExperienceLabel(selectedCase.experience) : '不適用'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                建立時間
              </Typography>
              <Typography>
                {new Date(selectedCase.createdAt).toLocaleString('zh-TW')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                用戶ID
              </Typography>
              <Typography>
                {selectedCase.studentId?.userId || selectedCase.student || '未指定'}
              </Typography>
            </Grid>

          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default CaseDetail; 