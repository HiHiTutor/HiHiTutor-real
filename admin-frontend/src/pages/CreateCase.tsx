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
  Stack,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { casesAPI } from '../services/api';
import api from '../services/api';

// 定義介面
interface Subject {
  value: string;
  label: string;
}

interface SubCategory {
  id: string;
  name: string;
  value: string;
  label: string;
  subjects: Subject[];
}

interface Category {
  value: string;
  label: string;
  subjects: Subject[];
  subCategories: SubCategory[];
}

interface Region {
  value: string;
  label: string;
}

interface TeachingMode {
  value: string;
  label: string;
}

const CreateCase: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'student' as 'student', // 固定為學生案例
    category: '',
    subCategory: '',
    subjects: [] as string[],
    regions: [] as string[],
    subRegions: [] as string[], // 添加缺失的 subRegions 字段
    budget: '',
    mode: '',
    experience: '',
  });
  
  // 數據源狀態
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [teachingModes, setTeachingModes] = useState<TeachingMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');

  // 載入數據源
  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setDataLoading(true);
      
      // 並行載入所有數據源
      const [categoriesRes, regionsRes, modesRes] = await Promise.all([
        api.get('/admin/config/categories').then((res: any) => res.data),
        api.get('/admin/config/regions').then((res: any) => res.data),
        api.get('/admin/config/teaching-modes').then((res: any) => res.data)
      ]);

      // 處理分類數據
      const categoriesArray = Object.entries(categoriesRes).map(([value, category]: [string, any]) => ({
        value,
        label: category.label,
        subjects: category.subjects || [],
        subCategories: (category.subCategories || []).map((subCat: any, index: number) => ({
          id: subCat.id || subCat.value || `sub-${index}`,
          name: subCat.name || subCat.label || subCat.value || `子分類${index}`,
          value: subCat.value || subCat.id || `sub-${index}`,
          label: subCat.label || subCat.name || subCat.value || `子分類${index}`,
          subjects: subCat.subjects || []
        }))
      }));

      setCategories(categoriesArray);
      setRegions(regionsRes);
      setTeachingModes(modesRes);
    } catch (err) {
      console.error('載入數據源失敗:', err);
      setError('載入數據源失敗，請稍後重試');
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject],
      });
      setNewSubject('');
    }
  };

  const handleDeleteSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((s) => s !== subject),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 確保數據包含所有必需字段
      const submitData = {
        ...formData,
        subRegions: formData.subRegions || [] // 確保 subRegions 存在
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

            {/* 類型 - 固定為學生案例 */}
            <TextField
              label="類型"
              name="type"
              value="學生案例"
              disabled
              helperText="案例類型固定為學生案例"
            />

            {/* 課程分類 */}
            <FormControl fullWidth required>
              <InputLabel>課程分類</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="課程分類"
                onChange={handleSelectChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 子分類 */}
            {formData.category && (
              <FormControl fullWidth>
                <InputLabel>子分類</InputLabel>
                <Select
                  name="subCategory"
                  value={formData.subCategory}
                  label="子分類"
                  onChange={handleSelectChange}
                >
                  {categories
                    .find(cat => cat.value === formData.category)
                    ?.subCategories?.map((subCat) => (
                      <MenuItem key={subCat.id} value={subCat.value}>
                        {subCat.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {/* 科目 */}
            <Box>
              <Typography variant="subtitle1">科目</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="新增科目"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddSubject}>
                  新增
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.subjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    onDelete={() => handleDeleteSubject(subject)}
                  />
                ))}
              </Stack>
            </Box>

            {/* 地區 */}
            <FormControl fullWidth required>
              <InputLabel>地區</InputLabel>
              <Select
                name="regions"
                multiple
                value={formData.regions}
                label="地區"
                onChange={(e) => setFormData({
                  ...formData,
                  regions: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={regions.find(r => r.value === value)?.label || value} />
                    ))}
                  </Box>
                )}
              >
                {regions.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="預算"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
            />

            {/* 教學模式 */}
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