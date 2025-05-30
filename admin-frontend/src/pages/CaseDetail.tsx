import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Case, SingleCaseResponse } from '../types/case';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCase, loading, error } = useAppSelector((state) => state.cases);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        dispatch(setLoading(true));
        if (id) {
          const response = await casesAPI.getCaseById(id);
          const { success, data } = response.data;
          if (success && data) {
            const caseData: Case = {
              id: data.id,
              title: data.title,
              description: data.description,
              type: data.type as 'student' | 'tutor',
              category: data.category,
              subCategory: data.subCategory,
              subjects: data.subjects,
              regions: data.regions,
              subRegions: data.subRegions,
              budget: data.budget,
              mode: data.mode as 'online' | 'offline' | 'hybrid',
              experience: data.experience,
              status: data.status,
              student: data.student,
              tutor: data.tutor,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            dispatch(setSelectedCase(caseData));
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
  }, [dispatch, id]);

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
            <Typography>{selectedCase.category}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Sub Category
            </Typography>
            <Typography>{selectedCase.subCategory || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Subjects
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.subjects.map((subject) => (
                <Chip key={subject} label={subject} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Regions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.regions.map((region) => (
                <Chip key={region} label={region} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Sub Regions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCase.subRegions.map((subRegion) => (
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