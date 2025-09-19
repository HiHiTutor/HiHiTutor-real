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
import {
  getCategoryLabel,
  getStatusLabel,
  getTypeLabel,
} from '../utils/translations';

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

      <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 80, position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
                編號
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>類型</TableCell>
              <TableCell sx={{ minWidth: 200, position: 'sticky', left: 80, backgroundColor: 'white', zIndex: 1 }}>
                標題
              </TableCell>
              <TableCell sx={{ minWidth: 120 }}>分類資訊</TableCell>
              <TableCell sx={{ minWidth: 150 }}>科目地區</TableCell>
              <TableCell sx={{ minWidth: 120 }}>費用時長</TableCell>
              <TableCell sx={{ minWidth: 100 }}>教學模式</TableCell>
              <TableCell sx={{ minWidth: 200 }}>詳細資訊</TableCell>
              <TableCell sx={{ minWidth: 120 }}>申請者</TableCell>
              <TableCell sx={{ minWidth: 80 }}>狀態</TableCell>
              <TableCell sx={{ minWidth: 100 }}>建立時間</TableCell>
              <TableCell sx={{ minWidth: 80, position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
                操作
              </TableCell>
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
                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <Typography variant="caption">
                    {caseItem.id || caseItem._id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(getCaseType(caseItem))}
                    color={getCaseTypeColor(getCaseType(caseItem))}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ position: 'sticky', left: 80, backgroundColor: 'white', zIndex: 1 }}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (caseItem.studentId?.email) {
                          window.open(`mailto:${caseItem.studentId.email}`, '_blank');
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
                  <Chip
                    label={getStatusLabel(caseItem.status)}
                    color={getStatusColor(caseItem.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(caseItem.createdAt).toLocaleDateString('zh-TW')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1 }}>
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