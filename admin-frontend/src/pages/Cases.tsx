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
  MenuItem,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setCases, setLoading, setError } from '../store/slices/caseSlice';
import { Case, CaseResponse, CaseStatus, CaseType } from '../types/case';
import AddIcon from '@mui/icons-material/Add';

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

const Cases: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cases, loading } = useAppSelector((state) => state.cases);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<CaseStatus>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [caseType, setCaseType] = useState<CaseType>('all');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        dispatch(setLoading(true));
        const response = await casesAPI.getCases({
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          search: searchQuery,
          type: caseType === 'all' ? undefined : caseType,
        });

        if (response.data.success && response.data.data) {
          const { cases, pagination } = response.data.data;
          if (Array.isArray(cases)) {
            dispatch(setCases(cases));
            setTotalCount(pagination.total);
          } else {
            console.error('Invalid cases data format:', cases);
            dispatch(setError('回應格式無效'));
            dispatch(setCases([]));
          }
        } else {
          console.error('Invalid response format:', response.data);
          dispatch(setError(response.data.message || '回應格式無效'));
          dispatch(setCases([]));
        }
      } catch (error: any) {
        console.error('Error fetching cases:', error);
        dispatch(setError(error.message || '獲取案例失敗'));
        dispatch(setCases([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCases();
  }, [dispatch, page, rowsPerPage, statusFilter, searchQuery, caseType]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const getCaseTypeColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'info';
      case 'tutor':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getCaseType = (caseItem: Case): 'student' | 'tutor' => {
    return caseItem.type;
  };

  const handleRowClick = (id: string | undefined, type: string) => {
    if (!id) return;
    navigate(`/cases/${id}?type=${type}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">案例管理</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/cases/create')}
          startIcon={<AddIcon />}
        >
          建立案例
        </Button>
      </Box>

      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="搜尋"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 200 }}
          />
          <TextField
            select
            label="案例類型"
            variant="outlined"
            size="small"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as CaseType)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">所有案例</MenuItem>
            <MenuItem value="student">學生案例</MenuItem>
            <MenuItem value="tutor">導師案例</MenuItem>
          </TextField>
          <TextField
            select
            label="狀態"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus)}
            sx={{ width: 150 }}
          >
            <MenuItem value="">所有狀態</MenuItem>
            <MenuItem value="open">開放中</MenuItem>
            <MenuItem value="matched">已配對</MenuItem>
            <MenuItem value="closed">已關閉</MenuItem>
            <MenuItem value="pending">待處理</MenuItem>
          </TextField>
        </Box>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>編號</TableCell>
              <TableCell>類型</TableCell>
              <TableCell>標題</TableCell>
              <TableCell>發佈者ID</TableCell>
              <TableCell>分類</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(cases || []).map((caseItem) => (
              <TableRow
                key={caseItem.id || caseItem._id}
                hover
                onClick={() => handleRowClick(caseItem.id || caseItem._id, caseItem.type)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{caseItem.id || caseItem._id}</TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(getCaseType(caseItem))}
                    color={getCaseTypeColor(getCaseType(caseItem))}
                    size="small"
                  />
                </TableCell>
                <TableCell>{caseItem.title}</TableCell>
                <TableCell>
                  {caseItem.type === 'student'
                    ? (caseItem.studentId?.userId
                        ? (
                            <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${caseItem.studentId!.userId}`);
                              }}
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                            >
                              {caseItem.studentId.userId}
                            </Button>
                          )
                        : '不適用')
                    : (caseItem.student?.userId
                        ? (
                            <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${caseItem.student!.userId}`);
                              }}
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                            >
                              {caseItem.student.userId}
                            </Button>
                          )
                        : '不適用')}
                </TableCell>
                <TableCell>{getCategoryLabel(caseItem.category)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(caseItem.status)}
                    color={getStatusColor(caseItem.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(caseItem.createdAt).toLocaleDateString('zh-TW')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cases/${caseItem.id}?type=${caseItem.type}`);
                    }}
                  >
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="每頁行數："
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default Cases; 