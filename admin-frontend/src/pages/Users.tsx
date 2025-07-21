import React, { useEffect, useState, useCallback } from 'react';
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
  TableSortLabel,
  Grid,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { usersAPI } from '../services/api';
import { setUsers, setLoading, setError } from '../store/slices/userSlice';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

type SortField = 'userId' | 'name' | 'email' | 'phone' | 'role' | 'userType' | 'tutorId' | 'status' | 'createdAt' | 'isVip' | 'isTop' | 'rating';
type SortOrder = 'asc' | 'desc';
type SearchType = 'all' | 'name' | 'email' | 'phone' | 'tutorId' | 'userId';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // 用於輸入框顯示
  const [searchType, setSearchType] = useState<SearchType>('all'); // 搜尋類型
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchQuery(query);
          setPage(0); // Reset to first page when searching
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Handle Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setPage(0);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await usersAPI.getUsers({
          page: page + 1,
          limit: rowsPerPage,
          role: roleFilter,
          userType: userTypeFilter,
          search: searchQuery,
          searchType: searchType, // 添加搜尋類型
          sortBy: sortField,
          sortOrder: sortOrder,
        });
        if (response.data && response.data.users) {
          dispatch(setUsers(response.data.users));
          setTotalCount(response.data.pagination?.total || 0);
        } else {
          dispatch(setError('Invalid response format'));
          dispatch(setUsers([]));
        }
      } catch (error) {
        dispatch(setError('Failed to fetch users'));
        dispatch(setUsers([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUsers();
  }, [dispatch, page, rowsPerPage, roleFilter, userTypeFilter, searchQuery, searchType, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUserTypeColor = (userType: string | undefined) => {
    switch (userType) {
      case 'tutor':
        return 'primary';
      case 'student':
        return 'secondary';
      case 'organization':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleViewUser = (userId: string | undefined) => {
    if (userId) {
      navigate(`/users/${userId}`);
    }
  };

  // 獲取搜尋欄位的placeholder
  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'name':
        return '搜尋姓名...';
      case 'email':
        return '搜尋電郵...';
      case 'phone':
        return '搜尋電話...';
      case 'tutorId':
        return '搜尋導師ID (如: TU0100)...';
      case 'userId':
        return '搜尋用戶ID...';
      default:
        return '搜尋姓名、電郵、電話、導師ID...';
    }
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
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/users/create')}
          startIcon={<AddIcon />}
        >
          Create User
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              select
              label="搜尋類型"
              variant="outlined"
              size="small"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              sx={{ width: 150 }}
            >
              <MenuItem value="all">全部欄位</MenuItem>
              <MenuItem value="name">姓名</MenuItem>
              <MenuItem value="email">電郵</MenuItem>
              <MenuItem value="phone">電話</MenuItem>
              <MenuItem value="tutorId">導師ID</MenuItem>
              <MenuItem value="userId">用戶ID</MenuItem>
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              label="搜尋"
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              placeholder={getSearchPlaceholder()}
              sx={{ width: 300 }}
            />
          </Grid>
          <Grid item>
            <TextField
              select
              label="Role"
              variant="outlined"
              size="small"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ width: 120 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              select
              label="User Type"
              variant="outlined"
              size="small"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="">All User Types</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'userId'}
                  direction={sortField === 'userId' ? sortOrder : 'asc'}
                  onClick={() => handleSort('userId')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortOrder : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'phone'}
                  direction={sortField === 'phone' ? sortOrder : 'asc'}
                  onClick={() => handleSort('phone')}
                >
                  Phone
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'role'}
                  direction={sortField === 'role' ? sortOrder : 'asc'}
                  onClick={() => handleSort('role')}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'userType'}
                  direction={sortField === 'userType' ? sortOrder : 'asc'}
                  onClick={() => handleSort('userType')}
                >
                  User Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'tutorId'}
                  direction={sortField === 'tutorId' ? sortOrder : 'asc'}
                  onClick={() => handleSort('tutorId')}
                >
                  Tutor ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'isVip'}
                  direction={sortField === 'isVip' ? sortOrder : 'asc'}
                  onClick={() => handleSort('isVip')}
                >
                  VIP等級
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'isTop'}
                  direction={sortField === 'isTop' ? sortOrder : 'asc'}
                  onClick={() => handleSort('isTop')}
                >
                  置頂等級
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'rating'}
                  direction={sortField === 'rating' ? sortOrder : 'asc'}
                  onClick={() => handleSort('rating')}
                >
                  評分
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Created At
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user) => (
              <TableRow key={user._id}>
                <TableCell>{(user as any).userId || user.id || user._id || 'N/A'}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.userType || 'N/A'}
                    color={getUserTypeColor(user.userType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.tutorId || 'N/A'}
                </TableCell>
                <TableCell>
                  {(user as any).isVip ? (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="VIP"
                      color="warning"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="普通"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(user as any).isTop ? (
                    <Chip
                      icon={<TrendingUpIcon />}
                      label="置頂"
                      color="info"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="普通"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(user as any).rating ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                      <Typography variant="body2">
                        {(user as any).rating.toFixed(1)}
                      </Typography>
                    </Box>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const userId = (user as any).userId || user.id || user._id;
                      if (userId && userId !== 'undefined' && userId !== 'null') {
                        handleViewUser(userId);
                      } else {
                        console.error('Invalid user ID for user:', user);
                      }
                    }}
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

export default Users; 