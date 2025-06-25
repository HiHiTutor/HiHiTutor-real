import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface TutorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  profileStatus: 'pending' | 'approved' | 'rejected';
  remarks: string;
  tutorProfile: {
    gender?: string;
    birthDate?: string;
    teachingExperienceYears?: number;
    educationLevel?: string;
    subjects?: string[];
    teachingAreas?: string[];
    teachingMethods?: string[];
    sessionRate?: number;
    introduction?: string;
    courseFeatures?: string;
    documents?: Array<{ type: string; url: string }>;
  };
  updatedAt: string;
}

const TutorProfileApprovals: React.FC = () => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    tutorId: string | null;
    remarks: string;
  }>({ open: false, tutorId: null, remarks: '' });

  useEffect(() => {
    fetchPendingTutorProfiles();
  }, []);

  const fetchPendingTutorProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/tutor-profiles/pending');
      
      if (response.data.success) {
        setTutors(response.data.data);
      } else {
        throw new Error(response.data.message || '獲取資料失敗');
      }
    } catch (error: any) {
      console.error('獲取待審核導師資料失敗:', error);
      setError(error.response?.data?.message || error.message || '獲取資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutorId: string) => {
    try {
      setReviewing(tutorId);
      
      const response = await api.patch(`/tutor-profiles/${tutorId}/approve`, {
        remarks: '審核通過'
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: '導師資料已批准',
          severity: 'success',
        });
        await fetchPendingTutorProfiles();
      } else {
        throw new Error(response.data.message || '批准失敗');
      }
    } catch (error: any) {
      console.error('批准失敗:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || '批准失敗',
        severity: 'error',
      });
    } finally {
      setReviewing(null);
    }
  };

  const handleReject = async (tutorId: string, remarks: string) => {
    try {
      setReviewing(tutorId);
      
      const response = await api.patch(`/tutor-profiles/${tutorId}/reject`, {
        remarks
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: '導師資料已拒絕',
          severity: 'success',
        });
        setRejectDialog({ open: false, tutorId: null, remarks: '' });
        await fetchPendingTutorProfiles();
      } else {
        throw new Error(response.data.message || '拒絕失敗');
      }
    } catch (error: any) {
      console.error('拒絕失敗:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || '拒絕失敗',
        severity: 'error',
      });
    } finally {
      setReviewing(null);
    }
  };

  const openRejectDialog = (tutorId: string) => {
    setRejectDialog({ open: true, tutorId, remarks: '' });
  };

  const closeRejectDialog = () => {
    setRejectDialog({ open: false, tutorId: null, remarks: '' });
  };

  const toggleRowExpansion = (tutorId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(tutorId)) {
      newExpandedRows.delete(tutorId);
    } else {
      newExpandedRows.add(tutorId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒絕';
      case 'pending':
        return '待審核';
      default:
        return status;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchPendingTutorProfiles}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        導師資料審批
      </Typography>
      
      {tutors.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            目前沒有待審核的導師資料
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>導師姓名</TableCell>
                <TableCell>聯絡方式</TableCell>
                <TableCell>更新時間</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutors.map((tutor) => (
                <React.Fragment key={tutor._id}>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{tutor.name}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(tutor._id)}
                        >
                          {expandedRows.has(tutor._id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tutor.email}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {tutor.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(tutor.updatedAt).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(tutor.profileStatus)}
                        color={getStatusColor(tutor.profileStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="批准">
                          <IconButton
                            color="success"
                            size="small"
                            disabled={reviewing === tutor._id}
                            onClick={() => handleApprove(tutor._id)}
                          >
                            {reviewing === tutor._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <CheckCircleIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="拒絕">
                          <IconButton
                            color="error"
                            size="small"
                            disabled={reviewing === tutor._id}
                            onClick={() => openRejectDialog(tutor._id)}
                          >
                            {reviewing === tutor._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <CancelIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedRows.has(tutor._id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                詳細資料
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    性別
                                  </Typography>
                                  <Typography variant="body2">
                                    {tutor.tutorProfile?.gender === 'male' ? '男' : '女'}
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    教學經驗
                                  </Typography>
                                  <Typography variant="body2">
                                    {tutor.tutorProfile?.teachingExperienceYears || 0} 年
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    學歷
                                  </Typography>
                                  <Typography variant="body2">
                                    {tutor.tutorProfile?.educationLevel || '未填寫'}
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    堂費
                                  </Typography>
                                  <Typography variant="body2">
                                    ${tutor.tutorProfile?.sessionRate || 0} / 小時
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    可教授科目
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {tutor.tutorProfile?.subjects?.map((subject, index) => (
                                      <Chip key={index} label={subject} size="small" />
                                    )) || []}
                                  </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    教學地區
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {tutor.tutorProfile?.teachingAreas?.map((area, index) => (
                                      <Chip key={index} label={area} size="small" variant="outlined" />
                                    )) || []}
                                  </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    個人介紹
                                  </Typography>
                                  <Typography variant="body2">
                                    {tutor.tutorProfile?.introduction || '未填寫'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 拒絕對話框 */}
      <Dialog open={rejectDialog.open} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>拒絕導師資料</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            請提供拒絕原因：
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectDialog.remarks}
            onChange={(e) => setRejectDialog({ ...rejectDialog, remarks: e.target.value })}
            placeholder="請說明拒絕原因..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog}>取消</Button>
          <Button
            onClick={() => handleReject(rejectDialog.tutorId!, rejectDialog.remarks)}
            color="error"
            disabled={!rejectDialog.remarks.trim() || reviewing === rejectDialog.tutorId}
          >
            {reviewing === rejectDialog.tutorId ? '處理中...' : '拒絕'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示訊息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TutorProfileApprovals; 