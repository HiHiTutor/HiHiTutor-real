import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { statisticsAPI } from '../services/api';
import { setStatistics, setError, setLoading } from '../store/slices/statisticsSlice';
import { DashboardStatistics } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { statistics, loading, error } = useAppSelector((state) => state.statistics);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchStatistics = async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      try {
        const response = await statisticsAPI.getPlatformStats();
        console.log('Statistics response:', response.data);
        dispatch(setStatistics(response.data));
      } catch (error) {
        console.error('Error fetching statistics:', error);
        dispatch(setError('載入儀表板資料失敗'));
        
        // Retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStatistics();
  }, [dispatch, retryCount]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => setRetryCount(prev => prev + 1)}>
          重試
        </Button>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>沒有可用資料</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        儀表板
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.totalStudents}</Typography>
            <Typography color="textSecondary">總學生數</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.totalTutors}</Typography>
            <Typography color="textSecondary">總導師數</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.activeCases}</Typography>
            <Typography color="textSecondary">活躍案例</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.successRate}%</Typography>
            <Typography color="textSecondary">成功率</Typography>
          </Paper>
        </Grid>

        {/* Hot Subjects - Only show if data is available */}
        {statistics.hotSubjects?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}>
                  <Typography variant="h6">熱門科目</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/statistics')}
                  >
                    查看全部
                  </Button>
                </Box>
                <List>
                  {statistics.hotSubjects.map((subject, index) => (
                    <React.Fragment key={subject.name}>
                      <ListItem>
                        <ListItemText
                          primary={subject.name}
                          secondary={`${subject.count} 個案例`}
                        />
                      </ListItem>
                      {index < statistics.hotSubjects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Activities - Only show if data is available */}
        {statistics.recentActivities?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}>
                  <Typography variant="h6">最近活動</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/cases')}
                  >
                    查看所有案例
                  </Button>
                </Box>
                <List>
                  {statistics.recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.timestamp).toLocaleString('zh-TW')}
                        />
                      </ListItem>
                      {index < statistics.recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 