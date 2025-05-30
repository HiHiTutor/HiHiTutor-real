import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setSelectedCase } from '../store/slices/caseSlice';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCase } = useAppSelector((state) => state.cases);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        if (id) {
          const response = await casesAPI.getCaseById(id);
          if (response.data.success && response.data.data) {
            const caseData = response.data.data;
            dispatch(setSelectedCase(caseData));
          } else {
            console.error('Invalid case data:', response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching case:', error);
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

  if (!selectedCase) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Case Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="textSecondary">Title</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedCase.title}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Subject</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedCase.subject}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Status</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={selectedCase.status}
                  color={getStatusColor(selectedCase.status)}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Created At</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {new Date(selectedCase.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedCase.student.name}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedCase.student.email}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Phone</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedCase.student.phone}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {selectedCase.tutor && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tutor Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography color="textSecondary">Name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedCase.tutor.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="textSecondary">Email</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedCase.tutor.email}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="textSecondary">Phone</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedCase.tutor.phone}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Case Description
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>{selectedCase.description}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaseDetail; 