import React, { useEffect } from 'react';
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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { statisticsAPI } from '../services/api';
import { setStatistics } from '../store/slices/statisticsSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.totalStudents}</Typography>
            <Typography color="textSecondary">Total Students</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.totalTutors}</Typography>
            <Typography color="textSecondary">Total Tutors</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.activeCases}</Typography>
            <Typography color="textSecondary">Active Cases</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{statistics.successRate}%</Typography>
            <Typography color="textSecondary">Success Rate</Typography>
          </Paper>
        </Grid>

        {/* Hot Subjects */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Hot Subjects</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/statistics')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {statistics.hotSubjects.slice(0, 5).map((subject, index) => (
                  <React.Fragment key={subject.name}>
                    <ListItem>
                      <ListItemText
                        primary={subject.name}
                        secondary={`${subject.count} cases`}
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Recent Activities</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/cases')}
                >
                  View All Cases
                </Button>
              </Box>
              <List>
                {statistics.recentActivities.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(
                          activity.timestamp
                        ).toLocaleString()}
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
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

export default Dashboard; 