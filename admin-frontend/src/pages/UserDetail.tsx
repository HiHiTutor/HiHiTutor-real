import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { usersAPI } from '../services/api';
import { setSelectedUser } from '../store/slices/userSlice';
import { User } from '../types';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector((state) => state.users);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    phone: string;
    userType: User['userType'];
    role: string;
    status: User['status'];
  }>({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    role: 'user',
    status: 'active',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (id) {
          const response = await usersAPI.getUserById(id);
          dispatch(setSelectedUser(response.data));
          setEditForm({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            userType: response.data.userType,
            role: response.data.role,
            status: response.data.status,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [dispatch, id]);

  const handleEdit = async () => {
    try {
      if (id) {
        await usersAPI.updateUser(id, editForm);
        const response = await usersAPI.getUserById(id);
        dispatch(setSelectedUser(response.data));
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleUpgradeApproval = async (type: string) => {
    try {
      if (id) {
        await usersAPI.approveUserUpgrade(id, type);
        const response = await usersAPI.getUserById(id);
        dispatch(setSelectedUser(response.data));
      }
    } catch (error) {
      console.error('Error approving upgrade:', error);
    }
  };

  if (!selectedUser) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">User Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.name}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Phone</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{selectedUser.phone}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">User Type</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip label={selectedUser.userType} color="primary" />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Role</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip label={selectedUser.role} color="secondary" />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary">Status</Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={selectedUser.status}
                  color={selectedUser.status === 'active' ? 'success' : 'error'}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Edit User
              </Button>
            </Box>
          </Paper>
        </Grid>

        {selectedUser.upgradeStatus === 'pending' && selectedUser.requestedRole && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upgrade Request
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Requested Role
                </Typography>
                <Typography>{selectedUser.requestedRole}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    if (selectedUser.requestedRole) {
                      handleUpgradeApproval(selectedUser.requestedRole);
                    }
                  }}
                >
                  Approve
                </Button>
                <Button variant="contained" color="error">
                  Reject
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <TextField
              label="Phone"
              fullWidth
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <TextField
              select
              label="User Type"
              fullWidth
              value={editForm.userType}
              onChange={(e) =>
                setEditForm({ ...editForm, userType: e.target.value as User['userType'] })
              }
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="tutor">Tutor</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>
            <TextField
              select
              label="Role"
              fullWidth
              value={editForm.role}
              onChange={(e) =>
                setEditForm({ ...editForm, role: e.target.value })
              }
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value as User['status'] })
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetail; 