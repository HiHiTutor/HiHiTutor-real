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
            dispatch(setError('Case not found'));
          }
        }
      } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch case details'));
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
        <Alert severity="info">No case found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Case Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {selectedCase.title}
            </Typography>
            <Chip
              label={selectedCase.status}
              color={getStatusColor(selectedCase.status)}
              sx={{ mr: 1 }}
            />
            <Chip label={selectedCase.type} color="secondary" />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography>{selectedCase.description}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Category
            </Typography>
            <Typography>{getCategoryLabel(selectedCase.category)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Sub Category
            </Typography>
            <Typography>{selectedCase.subCategory ? getSubCategoryLabel(selectedCase.subCategory) : 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Subjects
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.subjects?.map((subject) => (
                <Chip key={subject} label={subject} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Regions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.regions?.map((region) => (
                <Chip key={region} label={region} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Sub Regions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.subRegions?.map((subRegion) => (
                <Chip key={subRegion} label={subRegion} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Budget
            </Typography>
            <Typography>{selectedCase.budget}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Mode
            </Typography>
            <Typography>{selectedCase.mode}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Experience
            </Typography>
            <Typography>{selectedCase.experience || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Created At
            </Typography>
            <Typography>
              {new Date(selectedCase.createdAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CaseDetail; 