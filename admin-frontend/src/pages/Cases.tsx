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
            console.error('Invalid response format:', response);
            dispatch(setError('Invalid response format'));
            dispatch(setCases([]));
          }
        } else {
          console.error('Invalid response format:', response);
          dispatch(setError('Invalid response format'));
          dispatch(setCases([]));
        }
      } catch (error: any) {
        console.error('Error fetching cases:', error);
        dispatch(setError(error.message || 'Failed to fetch cases'));
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
        <Typography variant="h4">Cases</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/cases/create')}
          startIcon={<AddIcon />}
        >
          Create Case
        </Button>
      </Box>

      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 200 }}
          />
          <TextField
            select
            label="Case Type"
            variant="outlined"
            size="small"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as CaseType)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All Cases</MenuItem>
            <MenuItem value="student">Student Cases</MenuItem>
            <MenuItem value="tutor">Tutor Cases</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus)}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="matched">Matched</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Box>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Tutor</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(cases || []).map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell>{caseItem.id}</TableCell>
                <TableCell>
                  <Chip
                    label={getCaseType(caseItem)}
                    color={getCaseTypeColor(getCaseType(caseItem))}
                    size="small"
                  />
                </TableCell>
                <TableCell>{caseItem.title}</TableCell>
                <TableCell>{caseItem.student?.name || 'N/A'}</TableCell>
                <TableCell>
                  {caseItem.tutor ? caseItem.tutor.name : 'Not Assigned'}
                </TableCell>
                <TableCell>{caseItem.category}</TableCell>
                <TableCell>
                  <Chip
                    label={caseItem.status}
                    color={getStatusColor(caseItem.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(caseItem.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                  >
                    View
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
        />
      </TableContainer>
    </Box>
  );
};

export default Cases; 