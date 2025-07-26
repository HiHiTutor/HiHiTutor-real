import React, { useEffect } from 'react';
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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setSelectedCase, setLoading, setError } from '../store/slices/caseSlice';
import { Case } from '../types/case';

// 分類映射函數
const getCategoryLabel = (categoryValue: string): string => {
  const categoryMap: { [key: string]: string } = {
    'early-childhood': '幼兒教育',
    'primary-secondary': '中小學教育',
    'primary': '小學教育',
    'secondary': '中學教育',
    'interest': '興趣班',
    'tertiary': '大專補習課程',
    'adult': '成人教育',
    'unlimited': '不限'
  };
  
  return categoryMap[categoryValue] || categoryValue;
};

// 子分類映射函數
const getSubCategoryLabel = (subCategoryValue: string): string => {
  const subCategoryMap: { [key: string]: string } = {
    'one-on-one': '一對一',
    'small-group': '小班教學',
    'large-center': '補習社',
    'unlimited': '不限'
  };
  
  return subCategoryMap[subCategoryValue] || subCategoryValue;
};

// 狀態映射函數
const getStatusLabel = (statusValue: string): string => {
  const statusMap: { [key: string]: string } = {
    'open': '開放中',
    'matched': '已配對',
    'closed': '已關閉',
    'pending': '待處理'
  };
  
  return statusMap[statusValue] || statusValue;
};

// 類型映射函數
const getTypeLabel = (typeValue: string): string => {
  const typeMap: { [key: string]: string } = {
    'student': '學生案例',
    'tutor': '導師案例'
  };
  
  return typeMap[typeValue] || typeValue;
};

// 模式映射函數
const getModeLabel = (modeValue: string): string => {
  const modeMap: { [key: string]: string } = {
    'online': '網上教學',
    'offline': '面授教學',
    'hybrid': '混合教學',
    'unlimited': '不限'
  };
  
  return modeMap[modeValue] || modeValue;
};

// 經驗映射函數
const getExperienceLabel = (experienceValue: string): string => {
  const experienceMap: { [key: string]: string } = {
    'beginner': '初學者',
    'intermediate': '中級',
    'advanced': '高級',
    'expert': '專家級',
    'unlimited': '不限'
  };
  
  return experienceMap[experienceValue] || experienceValue;
};

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { selectedCase, loading, error } = useAppSelector((state) => state.cases);

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
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          返回案例列表
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
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
                <Chip key={subject} label={subject} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              地區
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.regions?.map((region) => (
                <Chip key={region} label={region} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              子地區
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.subRegions?.map((subRegion) => (
                <Chip key={subRegion} label={subRegion} />
              ))}
            </Box>
          </Grid>

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
        </Grid>
      </Paper>
    </Box>
  );
};

export default CaseDetail; 