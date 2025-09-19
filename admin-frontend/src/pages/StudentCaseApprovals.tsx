import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/redux';
import { setError } from '../store/slices/caseSlice';
import api from '../services/api';

interface StudentCase {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  subjects: string[];
  regions: string[];
  subRegions?: string[];
  budget: string;
  mode: string;
  modes?: string[];
  requirement?: string;
  requirements?: string;
  detailedAddress?: string;
  startDate?: string;
  duration: number;
  weeklyLessons: number;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
    userId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PendingStudentCasesResponse {
  success: boolean;
  data: {
    cases: StudentCase[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const StudentCaseApprovals: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [cases, setCases] = useState<StudentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCase, setSelectedCase] = useState<StudentCase | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchPendingCases();
  }, [page, rowsPerPage]);

  const fetchPendingCases = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/pending-student-cases?page=${page + 1}&limit=${rowsPerPage}`);
      
      if (response.data.success) {
        console.log('🔍 API回傳的案例資料:', JSON.stringify(response.data.data.cases, null, 2));
        setCases(response.data.data.cases);
        setTotalCount(response.data.data.pagination.total);
      } else {
        throw new Error('獲取待審批案例失敗');
      }
    } catch (error: any) {
      console.error('Error fetching pending cases:', error);
      dispatch(setError(error.message || '獲取待審批案例失敗'));
      setAlert({ type: 'error', message: error.message || '獲取待審批案例失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (caseId: string) => {
    try {
      setProcessing(true);
      const response = await api.put(`/admin/student-cases/${caseId}/approve`);
      
      if (response.data.success) {
        setAlert({ type: 'success', message: '案例審批成功' });
        // 從列表中移除已審批的案例
        setCases(prev => prev.filter(c => c.id !== caseId && c._id !== caseId));
        setTotalCount(prev => prev - 1);
      } else {
        throw new Error(response.data.message || '審批失敗');
      }
    } catch (error: any) {
      console.error('Error approving case:', error);
      setAlert({ type: 'error', message: error.message || '審批失敗' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCase) return;

    try {
      setProcessing(true);
      const response = await api.put(`/admin/student-cases/${selectedCase.id || selectedCase._id}/reject`, {
        reason: rejectReason
      });
      
      if (response.data.success) {
        setAlert({ type: 'success', message: '案例已拒絕' });
        // 從列表中移除已拒絕的案例
        setCases(prev => prev.filter(c => c.id !== selectedCase.id && c._id !== selectedCase._id));
        setTotalCount(prev => prev - 1);
        setRejectDialogOpen(false);
        setRejectReason('');
        setSelectedCase(null);
      } else {
        throw new Error(response.data.message || '拒絕失敗');
      }
    } catch (error: any) {
      console.error('Error rejecting case:', error);
      setAlert({ type: 'error', message: error.message || '拒絕失敗' });
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openRejectDialog = (caseItem: StudentCase) => {
    setSelectedCase(caseItem);
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
    setSelectedCase(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        學生案例審批
      </Typography>
      
      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <TableContainer sx={{ minWidth: 1200 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200, position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
                  標題
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>分類資訊</TableCell>
                <TableCell sx={{ minWidth: 150 }}>科目地區</TableCell>
                <TableCell sx={{ minWidth: 120 }}>費用時長</TableCell>
                <TableCell sx={{ minWidth: 100 }}>教學模式</TableCell>
                <TableCell sx={{ minWidth: 200 }}>詳細資訊</TableCell>
                <TableCell sx={{ minWidth: 120 }}>學生</TableCell>
                <TableCell sx={{ minWidth: 100 }}>創建時間</TableCell>
                <TableCell sx={{ minWidth: 120, position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id || caseItem._id}>
                  <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
                    <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {caseItem.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip 
                        label={caseItem.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {caseItem.subCategory || '無子分類'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {caseItem.subjects?.slice(0, 2).map((subject, index) => (
                          <Chip 
                            key={index} 
                            label={subject} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                        {caseItem.subjects && caseItem.subjects.length > 2 && (
                          <Chip 
                            label={`+${caseItem.subjects.length - 2}`} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {caseItem.regions?.slice(0, 2).map((region, index) => (
                          <Chip 
                            key={index} 
                            label={region} 
                            size="small" 
                            variant="outlined"
                            color="info"
                          />
                        ))}
                        {caseItem.regions && caseItem.regions.length > 2 && (
                          <Chip 
                            label={`+${caseItem.regions.length - 2}`} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2">
                        {caseItem.budget ? `$${caseItem.budget}/堂` : '待議'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {caseItem.duration ? 
                          (caseItem.duration >= 60 ? 
                            `${Math.floor(caseItem.duration / 60)}小時${caseItem.duration % 60 ? `${caseItem.duration % 60}分鐘` : ''}` :
                            `${caseItem.duration}分鐘`
                          ) : '未指定'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {caseItem.weeklyLessons ? `${caseItem.weeklyLessons}堂/週` : '未指定'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {caseItem.modes?.map((mode, index) => (
                        <Chip 
                          key={index} 
                          label={mode === 'in-person' ? '面授' : mode === 'online' ? '網課' : mode === 'both' ? '皆可' : mode} 
                          size="small" 
                          variant="outlined"
                        />
                      )) || <Chip label={caseItem.mode === 'in-person' ? '面授' : caseItem.mode === 'online' ? '網課' : caseItem.mode === 'both' ? '皆可' : caseItem.mode} size="small" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {caseItem.detailedAddress || '無詳細地址'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {caseItem.startDate ? new Date(caseItem.startDate).toLocaleDateString('zh-TW') : '未指定開始日期'}
                      </Typography>
                      <Typography variant="caption" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {caseItem.requirements || caseItem.requirement || '無詳細描述'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {caseItem.studentId ? (
                      <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                          const userId = caseItem.studentId?.userId;
                          if (userId) {
                            navigate(`/users/${userId}`);
                          }
                        }}
                        sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                      >
                        {caseItem.studentId.name || caseItem.studentId.userId || '未知'}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        未指定
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(caseItem.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="審批通過">
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(caseItem.id || caseItem._id || '')}
                          disabled={processing}
                          size="small"
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="拒絕案例">
                        <IconButton
                          color="error"
                          onClick={() => openRejectDialog(caseItem)}
                          disabled={processing}
                          size="small"
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="每頁行數:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* 拒絕原因對話框 */}
      <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>拒絕學生案例</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            請提供拒絕原因：
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="請輸入拒絕原因..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} disabled={processing}>
            取消
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={processing || !rejectReason.trim()}
          >
            {processing ? <CircularProgress size={20} /> : '確認拒絕'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCaseApprovals;
