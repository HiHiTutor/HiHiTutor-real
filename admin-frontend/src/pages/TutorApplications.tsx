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
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface TutorApplication {
  _id: string;
  id: string;
  userId: string;
  userNumber: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  subjects: string[];
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

const TutorApplications: React.FC = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/tutor-applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setApplications(response.data.data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('adminToken');
      const remarks = status === 'approved' 
        ? '資料齊全，審核通過' 
        : '不符合資格，請補交資料';

      const response = await axios.put(
        `${API_BASE_URL}/tutor-applications/${applicationId}/review`,
        {
          status,
          remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `申請已${status === 'approved' ? '批准' : '拒絕'}`,
          severity: 'success',
        });
        // 重新獲取資料以更新狀態
        fetchApplications();
      } else {
        throw new Error(response.data.message || 'Review failed');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      setSnackbar({
        open: true,
        message: '審核失敗，請稍後再試',
        severity: 'error',
      });
    }
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
        <Button variant="contained" onClick={fetchApplications}>
          重新載入
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        導師申請審核
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用戶編號</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>電話</TableCell>
              <TableCell>可教授科目</TableCell>
              <TableCell>上傳文件</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>申請時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>{application.userNumber}</TableCell>
                <TableCell>{application.name}</TableCell>
                <TableCell>{application.email}</TableCell>
                <TableCell>{application.phone}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {application.subjects.map((subject, index) => (
                      <Chip
                        key={index}
                        label={subject}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {application.documents.map((doc, index) => (
                      <Link
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <LinkIcon fontSize="small" />
                        文件 {index + 1}
                      </Link>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(application.status)}
                    color={getStatusColor(application.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(application.createdAt).toLocaleDateString('zh-TW')}
                </TableCell>
                <TableCell>
                  {application.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="審批通過">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleReview(application.id, 'approved')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="拒絕申請">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleReview(application.id, 'rejected')}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {application.status !== 'pending' && (
                    <Typography variant="body2" color="textSecondary">
                      {application.status === 'approved' ? '已批准' : '已拒絕'}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default TutorApplications; 