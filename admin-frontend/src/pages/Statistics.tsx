import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { statisticsAPI } from '../services/api';
import { setStatistics } from '../store/slices/statisticsSlice';

const Statistics: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { statistics } = useAppSelector((state) => state.statistics);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await statisticsAPI.getPlatformStats();
        dispatch(setStatistics(response.data));
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [dispatch]);

  if (!statistics) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Platform Statistics
        </Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/search-statistics')}
        >
          查看搜尋統計
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* User Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.totalStudents}
                    </Typography>
                    <Typography color="textSecondary">Total Students</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.totalTutors}
                    </Typography>
                    <Typography color="textSecondary">Total Tutors</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.activeUsers}
                    </Typography>
                    <Typography color="textSecondary">Active Users</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.newUsersThisMonth}
                    </Typography>
                    <Typography color="textSecondary">
                      New Users This Month
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Case Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Case Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.totalCases}
                    </Typography>
                    <Typography color="textSecondary">Total Cases</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.activeCases}
                    </Typography>
                    <Typography color="textSecondary">Active Cases</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.completedCases}
                    </Typography>
                    <Typography color="textSecondary">Completed Cases</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      {statistics.successRate}%
                    </Typography>
                    <Typography color="textSecondary">Success Rate</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Hot Subjects */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hot Subjects
              </Typography>
              <List>
                {statistics.hotSubjects.map((subject, index) => (
                  <React.Fragment key={subject.name}>
                    <ListItem>
                      <ListItemText
                        primary={subject.name}
                        secondary={`${subject.count} cases`}
                      />
                    </ListItem>
                    {index < statistics.hotSubjects.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {statistics.recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(
                          activity.timestamp
                        ).toLocaleString()}
                      />
                    </ListItem>
                    {index < statistics.recentActivities.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 