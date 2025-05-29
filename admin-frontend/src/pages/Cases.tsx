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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { casesAPI } from '../services/api';
import { setCases, setLoading, setError } from '../store/slices/caseSlice';

const Cases: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cases } = useAppSelector((state) => state.cases);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        dispatch(setLoading(true));
        const response = await casesAPI.getCases({
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter,
          search: searchQuery,
        });
        dispatch(setCases(response.data.cases));
      } catch (error) {
        dispatch(setError('Failed to fetch cases'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCases();
  }, [dispatch, page, rowsPerPage, statusFilter, searchQuery]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cases Management
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
          label="Status"
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="matched">Matched</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Tutor</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell>{caseItem.id}</TableCell>
                <TableCell>{caseItem.title}</TableCell>
                <TableCell>{caseItem.student.name}</TableCell>
                <TableCell>
                  {caseItem.tutor ? caseItem.tutor.name : 'Not Assigned'}
                </TableCell>
                <TableCell>{caseItem.subject}</TableCell>
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
          count={-1}
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